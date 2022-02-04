import { createSlice } from '@reduxjs/toolkit'

import { startLoading } from './isoxmlFile'

export const visualSettingsSlice = createSlice({
    name: 'visualSettings',
    initialState: {
        gridsVisibility: {},
        timeLogsVisibility: {},
        timeLogsSelectedDDI: {}
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
        },
        setTimeLogVisibility: (state, action) => {
            const {timeLogId, visible} = action.payload
            state.timeLogsVisibility[timeLogId] = visible
        },
        setTimeLogDDI: (state, action) => {
            const {timeLogId, ddi} = action.payload
            state.timeLogsSelectedDDI[timeLogId] = ddi
        }
    },
    extraReducers: builder => {
        builder.addCase(startLoading, state => {
            state.gridsVisibility = {}
            state.timeLogsVisibility = {}
        })
    }
})

// actions
export const {
    toggleGridVisibility,
    setGridVisibility,
    toggleTimeLogVisibility,
    setTimeLogVisibility,
    setTimeLogDDI
} = visualSettingsSlice.actions

// selectors
export const gridsVisibilitySelector = state => state.visualSettings.gridsVisibility
export const timeLogsVisibilitySelector = state => state.visualSettings.timeLogsVisibility
export const timeLogsSelectedDDISelector = state => state.visualSettings.timeLogsSelectedDDI

export default visualSettingsSlice.reducer
