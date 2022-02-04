// The reason to keet it out of the store is to avoid non-serializable and too big data in the store

import { ExtendedTimeLog, ISOXMLManager, TimeLogRecord } from "isoxml"

// No parts of this app should modify data in this ISOXMLManager
type DataLogValueInfo = {
    DDI: string
    minValue?: number
    maxValue?: number
}

interface TimeLogInfo {
    valuesInfo: DataLogValueInfo[]
    timeLogs: TimeLogRecord[]
    bbox?: [number, number, number, number]
}

interface ISOXMLManagerInfo {
    isoxmlManager: ISOXMLManager
    timeLogsCache?: {[timeLogId: string]: TimeLogInfo}
}
let isoxmlManagerInfo: ISOXMLManagerInfo


export const parseTimeLog = (timeLogId: string) => {
    if (isoxmlManagerInfo.timeLogsCache?.[timeLogId]) {
        return 
    }
    const timeLogInfo: any = {}

    let timeLog: ExtendedTimeLog
    for (const task of (isoxmlManagerInfo.isoxmlManager.rootElement.attributes.Task || [])) {
        timeLog = (task.attributes.TimeLog || []).find(timeLog => timeLog.attributes.Filename === timeLogId) as ExtendedTimeLog
        if (timeLog) {
            break;
        }
    }

    timeLogInfo.timeLogs = timeLog.parseBinaryFile()

    const ranges: {[ddi: string]: {min: number, max: number}} = {}

    const minPoint: [number, number] = [ Infinity,  Infinity]
    const maxPoint: [number, number] = [-Infinity, -Infinity]

    timeLogInfo.timeLogs.forEach(timeLogItem => {
        Object.keys(timeLogItem.values).forEach(ddi => {
            const value = timeLogItem.values[ddi]
            if (!(ddi in ranges)) {
                ranges[ddi] = {
                    min: value,
                    max: value
                }
            } else {
                ranges[ddi].min = Math.min(ranges[ddi].min, value)
                ranges[ddi].max = Math.max(ranges[ddi].max, value)
            }
        })

        minPoint[0] = Math.min(minPoint[0], timeLogItem.position.PositionEast)
        minPoint[1] = Math.min(minPoint[1], timeLogItem.position.PositionNorth)
        maxPoint[0] = Math.max(maxPoint[0], timeLogItem.position.PositionEast)
        maxPoint[1] = Math.max(maxPoint[1], timeLogItem.position.PositionNorth)
    })

    timeLogInfo.valuesInfo = (timeLog.timeLogInfo.attributes.DataLogValue || []).map(dlv => {
        const ddi = dlv.attributes.ProcessDataDDI
        const dlvInfo: DataLogValueInfo = {
            DDI: ddi
        }
        if (ddi in ranges) {
            dlvInfo.minValue = ranges[ddi].min
            dlvInfo.maxValue = ranges[ddi].max
        }

        return dlvInfo
    })

    timeLogInfo.bbox = [...minPoint, ...maxPoint]

    isoxmlManagerInfo.timeLogsCache[timeLogId] = timeLogInfo
}

export const getISOXMLManager = () => isoxmlManagerInfo?.isoxmlManager
export const getTimeLogsCache = () => isoxmlManagerInfo?.timeLogsCache

export const clearISOXMLManagerData = () => {
    isoxmlManagerInfo = null
}

export const setISOXMLManagerData = (isoxmlManager: ISOXMLManager, timeLogsCache: {[timeLogId: string]: TimeLogInfo}) => {
    isoxmlManagerInfo = {
        isoxmlManager,
        timeLogsCache
    }
}