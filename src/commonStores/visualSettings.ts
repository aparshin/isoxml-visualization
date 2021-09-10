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
        }
    },
    extraReducers: builder => {
        builder.addCase(loadingDone, (state => {
            state.gridsVisibility = {}
        }))
    }
})

// Action creators are generated for each case reducer function
export const { toggleGridVisibility } = visualSettingsSlice.actions

// selectors
export const gridsVisibilitySelector = state => state.visualSettings.gridsVisibility

export default visualSettingsSlice.reducer
