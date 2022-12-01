import { ExtendedPartfield, ExtendedTimeLog, ISOXMLManager, TimeLogInfo, TimeLogRecord } from "isoxml"

// The reason to keet it out of the store is to avoid non-serializable and too big data in the store
// No parts of this app should modify data in this ISOXMLManager

interface ISOXMLManagerInfo {
    isoxmlManager: ISOXMLManager
    timeLogsCache: {[timeLogId: string]: TimeLogInfo & {parsingErrors: string[], filledTimeLogs?: TimeLogRecord[]}}
    timeLogsGeoJSONs: {[timeLogId: string]: any}
    timeLogsFilledGeoJSONs: {[timeLogId: string]: any}
    timeLogsRangesWithoutOutliers: {[timeLogId: string]: {minValue: number, maxValue: number}[]},
    partfieldGeoJSONs: {[partfieldId: string]: any}
}

let isoxmlManagerInfo: ISOXMLManagerInfo

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

export const getRangeWithoutOutliers = (timeLogId: string, valueKey: string) => {
    const ranges = isoxmlManagerInfo.timeLogsRangesWithoutOutliers

    if (!(timeLogId in ranges)) {
        const timeLog = findTimeLogById(timeLogId)
        ranges[timeLogId] = timeLog.rangesWithoutOutliers()
    }

    const idx = isoxmlManagerInfo.timeLogsCache[timeLogId]?.valuesInfo.findIndex(info => info.valueKey === valueKey)
    return ranges[timeLogId][idx]
}

export const getTimeLogValuesRange = (timeLogId: string, valueKey: string, excludeOutliers: boolean) => {
    if (excludeOutliers) {
        return getRangeWithoutOutliers(timeLogId, valueKey)
    } else {
        const timeLogInfo = getTimeLogInfo(timeLogId)
        const valueInfo = timeLogInfo.valuesInfo.find(info => info.valueKey === valueKey)

        return {
            minValue: valueInfo.minValue,
            maxValue: valueInfo.maxValue
        }
    }
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