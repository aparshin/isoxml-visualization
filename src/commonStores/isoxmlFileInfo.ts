import { ExtendedTimeLog, ISOXMLManager, TimeLogInfo } from "isoxml"

// The reason to keet it out of the store is to avoid non-serializable and too big data in the store
// No parts of this app should modify data in this ISOXMLManager

interface ISOXMLManagerInfo {
    isoxmlManager: ISOXMLManager
    timeLogsCache: {[timeLogId: string]: TimeLogInfo}
    timeLogsGeoJSONs: {[timeLogId: string]: any}
}

let isoxmlManagerInfo: ISOXMLManagerInfo


export const parseTimeLog = (timeLogId: string) => {
    if (isoxmlManagerInfo.timeLogsCache?.[timeLogId]) {
        return 
    }

    let timeLog: ExtendedTimeLog
    for (const task of (isoxmlManagerInfo.isoxmlManager.rootElement.attributes.Task || [])) {
        timeLog = (task.attributes.TimeLog || []).find(timeLog => timeLog.attributes.Filename === timeLogId) as ExtendedTimeLog
        if (timeLog) {
            break;
        }
    }

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

export const getISOXMLManager = () => isoxmlManagerInfo?.isoxmlManager
export const getTimeLogsCache = () => isoxmlManagerInfo?.timeLogsCache
export const getTimeLogInfo = (timeLogId: string) => isoxmlManagerInfo?.timeLogsCache[timeLogId]

export const clearISOXMLManagerData = () => {
    isoxmlManagerInfo = null
}

export const setISOXMLManagerData = (isoxmlManager: ISOXMLManager, timeLogsCache: {[timeLogId: string]: TimeLogInfo}) => {
    isoxmlManagerInfo = {
        isoxmlManager,
        timeLogsCache,
        timeLogsGeoJSONs: {}
    }
}