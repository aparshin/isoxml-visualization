import { configureStore } from '@reduxjs/toolkit'
import isoxmlFileReducer from './commonStores/isoxmlFile'
import visualSettingsReducer from './commonStores/visualSettings'
import mapReducer from './commonStores/map'

const store = configureStore({
    reducer: {
        isoxmlFile: isoxmlFileReducer,
        visualSettings: visualSettingsReducer,
        map: mapReducer
    }
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store