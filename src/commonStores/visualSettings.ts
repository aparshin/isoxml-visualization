import { createSlice } from '@reduxjs/toolkit'

import { RootState } from '../store'
import { isMergedTimeLogId } from '../utils'
import { getMergedTimeLogInfo, getTimeLogInfo } from './isoxmlFileInfo'
import { startLoading } from './isoxmlFile'

interface VisualSettingsState {
    gridsVisibility: Record<string, boolean>
    timeLogsVisibility: Record<string, boolean>
    partfieldsVisibility: Record<string, boolean>
    timeLogsSelectedValue: Record<string, string>
    excludeOutliers: Record<string, boolean>,
    fillMissingValues: Record<string, boolean>
    mergeTimeLogs: Record<string, boolean>
    excludeFromMergedTimeLogs: Record<string, Record<string, boolean>> // [taskId][timeLogId]
}

const setDefaultTimeLogValue = (state: VisualSettingsState, id: string) => {
    if (!state.timeLogsSelectedValue[id] && state.timeLogsVisibility[id]) {
        const timeLogInfo = isMergedTimeLogId(id)
            ? getMergedTimeLogInfo(id)
            : getTimeLogInfo(id)
        const variableValuesInfo = timeLogInfo.valuesInfo.find(
            valueInfo => valueInfo.minValue !== undefined
        )
        if (variableValuesInfo) {
            state.timeLogsSelectedValue[id] = variableValuesInfo.valueKey
        }
    }
}

const initialState: VisualSettingsState = {
    gridsVisibility: {},
    timeLogsVisibility: {},
    partfieldsVisibility: {},
    timeLogsSelectedValue: {},
    excludeOutliers: {},
    fillMissingValues: {},
    mergeTimeLogs: {},
    excludeFromMergedTimeLogs: {}
}

export const visualSettingsSlice = createSlice({
    name: 'visualSettings',
    initialState,
    reducers: {
        setGridVisibility: (state, action) => {
            const {gridId, visible} = action.payload
            state.gridsVisibility[gridId] = visible
        },
        setTimeLogVisibility: (state, action) => {
            const {timeLogId, visible} = action.payload
            state.timeLogsVisibility[timeLogId] = visible
            setDefaultTimeLogValue(state, timeLogId)
        },
        setPartfieldVisibility: (state, action) => {
            const {partfieldId, visible} = action.payload
            state.partfieldsVisibility[partfieldId] = visible
        },
        setTimeLogValue: (state, action) => {
            const {timeLogId, valueKey} = action.payload
            state.timeLogsSelectedValue[timeLogId] = valueKey
        },
        setExcludeOutliers: (state, action) => {
            const {timeLogId, exclude} = action.payload
            state.excludeOutliers[timeLogId] = exclude
        },
        setFillMissingOutliers: (state, action) => {
            const {timeLogId, fill} = action.payload
            state.fillMissingValues[timeLogId] = fill
        },
        toggleMergeTimeLogs: (state, action) => {
            const {taskId} = action.payload
            state.mergeTimeLogs[taskId] = !state.mergeTimeLogs[taskId]
        },
        toggleExcludeMergedTimeLog: (state, action) => {
            const {taskId, timeLogId} = action.payload
            if (!state.excludeFromMergedTimeLogs[taskId]) {
                state.excludeFromMergedTimeLogs[taskId] = {}
            }

            state.excludeFromMergedTimeLogs[taskId][timeLogId] = !state.excludeFromMergedTimeLogs[taskId][timeLogId]
        }
    },
    extraReducers: builder => {
        builder.addCase(startLoading, () => initialState)
    }
})

// actions
export const {
    setGridVisibility,
    setTimeLogVisibility,
    setPartfieldVisibility,
    setTimeLogValue,
    setExcludeOutliers,
    setFillMissingOutliers,
    toggleMergeTimeLogs,
    toggleExcludeMergedTimeLog
} = visualSettingsSlice.actions

// selectors
export const gridsVisibilitySelector = (state: RootState) => state.visualSettings.gridsVisibility
export const gridVisibilitySelector =
    (state: RootState, gridId: string) => !!state.visualSettings.gridsVisibility[gridId]

export const timeLogsVisibilitySelector = (state: RootState) => state.visualSettings.timeLogsVisibility
export const timeLogVisibilitySelector =
    (state: RootState, timeLogId: string) => !!state.visualSettings.timeLogsVisibility[timeLogId]

export const partfieldsVisibilitySelector = (state: RootState) => state.visualSettings.partfieldsVisibility
export const partfieldVisibilitySelector =
    (state: RootState, partfieldId: string) => !!state.visualSettings.partfieldsVisibility[partfieldId]

export const timeLogsSelectedValueSelector = (state: RootState) => state.visualSettings.timeLogsSelectedValue
export const timeLogSelectedValueSelector =
    (state: RootState, timeLogId: string) => state.visualSettings.timeLogsSelectedValue[timeLogId]

export const timeLogsExcludeOutliersSelector = (state: RootState) => state.visualSettings.excludeOutliers
export const timeLogExcludeOutliersSelector =
    (state: RootState, timeLogId: string) => !!state.visualSettings.excludeOutliers[timeLogId]

export const timeLogsFillMissingValuesSelector = (state: RootState) => state.visualSettings.fillMissingValues
export const timeLogFillMissingValuesSelector =
    (state: RootState, timeLogId: string) => !!state.visualSettings.fillMissingValues[timeLogId]

export const mergeTimeLogsSelector = (state: RootState) => state.visualSettings.mergeTimeLogs
export const excludedMergedTimeLogsSelector =
    (state: RootState, taskId: string) => state.visualSettings.excludeFromMergedTimeLogs[taskId] ?? {}
export const allExcludedMergedTimeLogsSelector =
    (state: RootState) => state.visualSettings.excludeFromMergedTimeLogs

export default visualSettingsSlice.reducer
