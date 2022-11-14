import { ExtendedPartfield, ExtendedTimeLog, ISOXMLManager, TimeLogInfo } from "isoxml"

// The reason to keet it out of the store is to avoid non-serializable and too big data in the store
// No parts of this app should modify data in this ISOXMLManager

interface ISOXMLManagerInfo {
    isoxmlManager: ISOXMLManager
    timeLogsCache: {[timeLogId: string]: TimeLogInfo}
    timeLogsGeoJSONs: {[timeLogId: string]: any}
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

export const parseTimeLog = (timeLogId: string) => {
    if (isoxmlManagerInfo.timeLogsCache?.[timeLogId]) {
        return 
    }

    const timeLog = findTimeLogById(timeLogId)
    isoxmlManagerInfo.timeLogsCache[timeLogId] = timeLog.parseBinaryFile()
}

export const getTimeLogGeoJSON = (timeLogId: string) => {
    if (!isoxmlManagerInfo) {
        return null
    }

    if (isoxmlManagerInfo?.timeLogsGeoJSONs[timeLogId]) {
        return isoxmlManagerInfo.timeLogsGeoJSONs[timeLogId]
    }

    parseTimeLog(timeLogId)

    const timeLogs = isoxmlManagerInfo.timeLogsCache[timeLogId].timeLogs

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

    isoxmlManagerInfo.timeLogsGeoJSONs[timeLogId] = geoJSON
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

export const setISOXMLManagerData = (isoxmlManager: ISOXMLManager, timeLogsCache: {[timeLogId: string]: TimeLogInfo}) => {
    isoxmlManagerInfo = {
        isoxmlManager,
        timeLogsCache,
        timeLogsGeoJSONs: {},
        timeLogsRangesWithoutOutliers: {},
        partfieldGeoJSONs: {}
    }
}