import { createSlice } from '@reduxjs/toolkit'

export const mapSlice = createSlice({
    name: 'isoxmlFile',
    initialState: {
        fitBounds: null
    },
    reducers: {
        fitBounds: (state, action) => {
            state.fitBounds = action.payload
        }
    }
})

export const { fitBounds } = mapSlice.actions

export default mapSlice.reducer

export const fitBoundsSelector = state => state.map.fitBounds