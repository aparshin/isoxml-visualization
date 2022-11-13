import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface MapState {
    fitBounds: [number, number, number, number] | undefined
}

export const mapSlice = createSlice({
    name: 'isoxmlFile',
    initialState: {
        fitBounds: undefined
    } as MapState,
    reducers: {
        fitBounds: (state, action) => {
            state.fitBounds = action.payload
        }
    }
})

export const { fitBounds } = mapSlice.actions

export default mapSlice.reducer

export const fitBoundsSelector = (state: RootState) => state.map.fitBounds