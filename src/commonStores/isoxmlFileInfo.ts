import {
    DataLogValueInfo,
    ExtendedPartfield,
    ExtendedTimeLog,
    ISOXMLManager,
    Task,
    TimeLogInfo,
    TimeLogRecord
} from "isoxml"

// The reason to keet it out of the store is to avoid non-serializable and too big data in the store
// No parts of this app should modify data in this ISOXMLManager

type ExtendedTimeLogInfo = TimeLogInfo & {parsingErrors: string[], filledTimeLogs?: TimeLogRecord[]}

interface ISOXMLManagerInfo {
    isoxmlManager: ISOXMLManager
    timeLogsCache: {[timeLogId: string]: ExtendedTimeLogInfo}
    timeLogsGeoJSONs: {[timeLogId: string]: any}
    timeLogsFilledGeoJSONs: {[timeLogId: string]: any}
    timeLogsRangesWithoutOutliers: {[timeLogId: string]: {minValue: number, maxValue: number}[]},
    partfieldGeoJSONs: {[partfieldId: string]: any}
}

let isoxmlManagerInfo: ISOXMLManagerInfo

export function isMergedTimeLogId(timeLogId: string) {
    return timeLogId.startsWith('TSK')
}

function findTimeLogById (timeLogId: string) {
    for (const task of (isoxmlManagerInfo.isoxmlManager.rootElement.attributes.Task || [])) {
        const timeLog = (task.attributes.TimeLog || [])
            .find(timeLog => timeLog.attributes.Filename === timeLogId) as ExtendedTimeLog
        if (timeLog) {
            return timeLog
        }
    }
    return null
}

export const parseTimeLog = (timeLogId: string, fillMissingValues: boolean) => {
    let timeLog: ExtendedTimeLog = undefined

    if (!isoxmlManagerInfo.timeLogsCache?.[timeLogId]) {
        timeLog = findTimeLogById(timeLogId)
        const timeLogInfo = timeLog.parseBinaryFile()
        isoxmlManagerInfo.timeLogsCache[timeLogId] = {
            ...timeLogInfo,
            timeLogs: timeLogInfo.timeLogs.filter(timeLog => timeLog.isValidPosition),
            parsingErrors: timeLog.parsingErrors
        }
    }

    const timeLogInfo = isoxmlManagerInfo.timeLogsCache[timeLogId]
    if (fillMissingValues && !timeLogInfo.filledTimeLogs) {
        timeLog = timeLog || findTimeLogById(timeLogId)
        timeLogInfo.filledTimeLogs = timeLog.getFilledTimeLogs()
    }
}

export const parseAllTaskTimeLogs = (taskId: string, fillMissingValues: boolean) => {
    const task = isoxmlManagerInfo.isoxmlManager.getEntityByXmlId<Task>(taskId)
    if (!task) {
        return
    }

    ;(task.attributes.TimeLog || [])
        .filter((timeLog: ExtendedTimeLog) => timeLog.binaryData && timeLog.timeLogHeader)
        .forEach(timeLog => {
            parseTimeLog(timeLog.attributes.Filename, fillMissingValues)
        })
}

export const getTimeLogGeoJSON = (timeLogId: string, fillMissingValues: boolean) => {
    if (!isoxmlManagerInfo) {
        return null
    }

    const targetKey = fillMissingValues ? 'timeLogsFilledGeoJSONs' : 'timeLogsGeoJSONs'

    if (isoxmlManagerInfo?.[targetKey][timeLogId]) {
        return isoxmlManagerInfo[targetKey][timeLogId]
    }

    parseTimeLog(timeLogId, fillMissingValues)

    const timeLogs = fillMissingValues
        ? isoxmlManagerInfo.timeLogsCache[timeLogId].filledTimeLogs
        : isoxmlManagerInfo.timeLogsCache[timeLogId].timeLogs

    const geoJSON = {
        type: 'FeatureCollection',
        features: timeLogs
            .map(timeLogItem => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [timeLogItem.position.PositionEast, timeLogItem.position.PositionNorth]
                },
                properties: timeLogItem.values
            }))
    }

    isoxmlManagerInfo[targetKey][timeLogId] = geoJSON
    return geoJSON
}

export const getMergedTimeLogGeoJSON = (taskId: string, fillMissingValues: boolean) => {
    const task = isoxmlManagerInfo.isoxmlManager.getEntityByXmlId<Task>(taskId)
    if (!task) {
        return
    }

    return {
        type: 'FeatureCollection',
        features: (task.attributes.TimeLog || [])
            .filter((timeLog: ExtendedTimeLog) => timeLog.binaryData && timeLog.timeLogHeader)
            .flatMap(timeLog => {
                const timeLogId = timeLog.attributes.Filename
                const geoJSON = getTimeLogGeoJSON(timeLogId, fillMissingValues)
                return geoJSON.features.map(feature => ({
                    ...feature,
                    properties: {
                        ...feature.properties,
                        originalTimeLogId: timeLogId
                    }
                }))
            })
    }
}

export const getPartfieldGeoJSON = (partfieldId: string) => {
    if (!isoxmlManagerInfo) {
        return null
    }

    if (!isoxmlManagerInfo?.partfieldGeoJSONs[partfieldId]) {
        const partfield = isoxmlManagerInfo.isoxmlManager.getEntityByXmlId<ExtendedPartfield>(partfieldId)
        isoxmlManagerInfo.partfieldGeoJSONs[partfieldId] = partfield.toGeoJSON()
    }

    return isoxmlManagerInfo.partfieldGeoJSONs[partfieldId]
}

export const getISOXMLManager = () => isoxmlManagerInfo?.isoxmlManager
export const getTimeLogsCache = () => isoxmlManagerInfo?.timeLogsCache
export const getTimeLogInfo = (timeLogId: string) => isoxmlManagerInfo?.timeLogsCache[timeLogId]

const unionBbox = (
    bbox1: TimeLogInfo['bbox'],
    bbox2: TimeLogInfo['bbox']
) => [
    Math.min(bbox1[0], bbox2[0]),
    Math.min(bbox1[1], bbox2[1]),
    Math.max(bbox1[2], bbox2[2]),
    Math.max(bbox1[3], bbox2[3])
] as TimeLogInfo['bbox']

const mergeValueInfo = (valueInfo1: DataLogValueInfo, valueInfo2: DataLogValueInfo) => {
    if (!valueInfo1) {
        return valueInfo2
    }

    return {
        ...valueInfo2,
        minValue: valueInfo1.minValue !== undefined && valueInfo2.minValue !== undefined
            ? Math.min(valueInfo1.minValue, valueInfo2.minValue)
            : valueInfo1.minValue ?? valueInfo2.minValue,
        maxValue: valueInfo1.maxValue !== undefined && valueInfo2.maxValue !== undefined
            ? Math.max(valueInfo1.maxValue, valueInfo2.maxValue)
            : valueInfo1.maxValue ?? valueInfo2.maxValue,
    }
}

export const getMergedTimeLogInfo = (taskId: string): ExtendedTimeLogInfo => {
    const task = isoxmlManagerInfo.isoxmlManager.getEntityByXmlId<Task>(taskId)
    if (!task) {
        return
    }

    let mergedBbox: [number, number, number, number]
    const mergedValuesInfo: Record<string, DataLogValueInfo> = {}
    let parsingErrors: string[] = []

    ;(task.attributes.TimeLog || [])
        .filter((timeLog: ExtendedTimeLog) => timeLog.binaryData && timeLog.timeLogHeader)
        .forEach(timeLog => {
            const timeLogInfo = getTimeLogInfo(timeLog.attributes.Filename)

            if (!mergedBbox) {
                mergedBbox = timeLogInfo.bbox
            } else if (timeLogInfo.bbox) {
                mergedBbox = unionBbox(mergedBbox, timeLogInfo.bbox)
            }

            timeLogInfo.valuesInfo.forEach(valueInfo => {
                mergedValuesInfo[valueInfo.valueKey] = mergeValueInfo(
                    mergedValuesInfo[valueInfo.valueKey],
                    valueInfo
                )
            })

            parsingErrors = [
                ...parsingErrors,
                ...(timeLogInfo.parsingErrors?.map(error => `${timeLog.attributes.Filename}: ${error}`) ?? [])
            ]
        })

    return {
        bbox: mergedBbox,
        valuesInfo: Object.values(mergedValuesInfo),
        parsingErrors,
        // we never use TimeLogs from merged TimeLogInfo
        timeLogs: [],
        filledTimeLogs: []
    }
}

const getRangeWithoutOutliers = (timeLogId: string, valueKey: string) => {
    const ranges = isoxmlManagerInfo.timeLogsRangesWithoutOutliers

    if (!(timeLogId in ranges)) {
        const timeLog = findTimeLogById(timeLogId)
        ranges[timeLogId] = timeLog.rangesWithoutOutliers()
    }

    const idx = isoxmlManagerInfo.timeLogsCache[timeLogId]?.valuesInfo.findIndex(info => info.valueKey === valueKey)
    return idx >= 0 ? ranges[timeLogId][idx] : undefined
}

export const getTimeLogValuesRange = (timeLogId: string, valueKey: string, excludeOutliers: boolean) => {
    if (excludeOutliers) {
        return getRangeWithoutOutliers(timeLogId, valueKey)
    } else {
        const timeLogInfo = getTimeLogInfo(timeLogId)
        const valueInfo = timeLogInfo.valuesInfo.find(info => info.valueKey === valueKey)

        return valueInfo ? {
            minValue: valueInfo.minValue,
            maxValue: valueInfo.maxValue
        } : undefined
    }
}

export const getTaskTimeLogsValuesRange = (taskId: string, valueKey: string, excludeOutliers: boolean) => {
    const task = isoxmlManagerInfo.isoxmlManager.getEntityByXmlId<Task>(taskId)
    if (!task) {
        return
    }

    return (task.attributes.TimeLog || [])
        .filter((timeLog: ExtendedTimeLog) => timeLog.binaryData && timeLog.timeLogHeader)
        .reduce((range, timeLog) => {
            const timeLogRange = getTimeLogValuesRange(timeLog.attributes.Filename, valueKey, excludeOutliers)
            return {
                minValue: range?.minValue !== undefined && timeLogRange?.minValue !== undefined
                    ? Math.min(range?.minValue, timeLogRange?.minValue)
                    : range?.minValue ?? timeLogRange?.minValue,
                maxValue: range?.maxValue !== undefined && timeLogRange?.maxValue !== undefined
                    ? Math.max(range?.maxValue, timeLogRange?.maxValue)
                    : range?.maxValue ?? timeLogRange?.maxValue
            }
        }, undefined as {minValue: number, maxValue: number})
}

export function getTaskIdByTimeLogFilename (timeLogFilename: string) {
    for (const task of (isoxmlManagerInfo.isoxmlManager.rootElement.attributes.Task || [])) {
        const timeLog = (task.attributes.TimeLog || [])
            .find(timeLog => timeLog.attributes.Filename === timeLogFilename) as ExtendedTimeLog
        if (timeLog) {
            return isoxmlManagerInfo.isoxmlManager.getReferenceByEntity(task).xmlId
        }
    }
    return null
}


export const clearISOXMLManagerData = () => {
    isoxmlManagerInfo = null
}

export const setISOXMLManagerData = (isoxmlManager: ISOXMLManager) => {
    isoxmlManagerInfo = {
        isoxmlManager,
        timeLogsCache: {},
        timeLogsGeoJSONs: {},
        timeLogsFilledGeoJSONs: {},
        timeLogsRangesWithoutOutliers: {},
        partfieldGeoJSONs: {}
    }
}