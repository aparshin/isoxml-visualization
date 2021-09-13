import { createSlice } from '@reduxjs/toolkit'

import {loadingDone} from './isoxmlFile'

export const visualSettingsSlice = createSlice({
    name: 'visualSettings',
    initialState: {
        gridsVisibility: {}
    },
    reducers: {
        toggleGridVisibility: (state, action) => {
            const id = action.payload.gridId
            state.gridsVisibility[id] = !state.gridsVisibility[id]
        },
        setGridVisibility: (state, action) => {
            const {gridId, visible} = action.payload
            state.gridsVisibility[gridId] = visible
        }
    },
    extraReducers: builder => {
        builder.addCase(loadingDone, (state => {
            state.gridsVisibility = {}
        }))
    }
})

// actions
export const { toggleGridVisibility, setGridVisibility } = visualSettingsSlice.actions

// selectors
export const gridsVisibilitySelector = state => state.visualSettings.gridsVisibility

export default visualSettingsSlice.reducer
