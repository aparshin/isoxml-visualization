import { createSlice } from '@reduxjs/toolkit'

import { startLoading } from './isoxmlFile'
import { getTimeLogsCache } from './isoxmlFileInfo'

const setDefaultTimeLogValue = (state, id) => {
    if (!state.timeLogsSelectedValue[id] && state.timeLogsVisibility[id]) {
        const timeLogCache = getTimeLogsCache()[id]
        const variableValuesInfo = timeLogCache.valuesInfo.find(
            valueInfo => 'minValue' in valueInfo && valueInfo.minValue !== valueInfo.maxValue
        )
        if (variableValuesInfo) {
            state.timeLogsSelectedValue[id] = variableValuesInfo.valueKey
        }
    }
}

export const visualSettingsSlice = createSlice({
    name: 'visualSettings',
    initialState: {
        gridsVisibility: {},
        timeLogsVisibility: {},
        timeLogsSelectedValue: {},
        excludeOutliers: {}
    },
    reducers: {
        toggleGridVisibility: (state, action) => {
            const id = action.payload.gridId
            state.gridsVisibility[id] = !state.gridsVisibility[id]
        },
        setGridVisibility: (state, action) => {
            const {gridId, visible} = action.payload
            state.gridsVisibility[gridId] = visible
        },
        toggleTimeLogVisibility: (state, action) => {
            const id = action.payload.timeLogId
            state.timeLogsVisibility[id] = !state.timeLogsVisibility[id]
            setDefaultTimeLogValue(state, id)
        },
        setTimeLogVisibility: (state, action) => {
            const {timeLogId, visible} = action.payload
            state.timeLogsVisibility[timeLogId] = visible
            setDefaultTimeLogValue(state, timeLogId)
        },
        setTimeLogValue: (state, action) => {
            const {timeLogId, valueKey} = action.payload
            state.timeLogsSelectedValue[timeLogId] = valueKey
        },
        setExcludeOutliers: (state, action) => {
            const {timeLogId, exclude} = action.payload
            state.excludeOutliers[timeLogId] = exclude
        }
    },
    extraReducers: builder => {
        builder.addCase(startLoading, state => {
            state.gridsVisibility = {}
            state.timeLogsVisibility = {}
            state.timeLogsSelectedValue = {}
            state.excludeOutliers = {}
        })
    }
})

// actions
export const {
    toggleGridVisibility,
    setGridVisibility,
    toggleTimeLogVisibility,
    setTimeLogVisibility,
    setTimeLogValue,
    setExcludeOutliers
} = visualSettingsSlice.actions

// selectors
export const gridsVisibilitySelector = state => state.visualSettings.gridsVisibility
export const gridVisibilitySelector = (state, gridId: string) => !!state.visualSettings.gridsVisibility[gridId]

export const timeLogsVisibilitySelector = state => state.visualSettings.timeLogsVisibility
export const timeLogVisibilitySelector = (state, timeLogId: string) => !!state.visualSettings.timeLogsVisibility[timeLogId]

export const timeLogsSelectedValueSelector = state => state.visualSettings.timeLogsSelectedValue
export const timeLogSelectedValueSelector =
    (state, timeLogId: string) => state.visualSettings.timeLogsSelectedValue[timeLogId]

export const timeLogsExcludeOutliersSelector = state => state.visualSettings.excludeOutliers
export const timeLogExcludeOutliersSelector = (state, timeLogId: string) => !!state.visualSettings.excludeOutliers[timeLogId]

export default visualSettingsSlice.reducer
