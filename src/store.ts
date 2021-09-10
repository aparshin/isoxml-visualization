import { configureStore } from '@reduxjs/toolkit'
import isoxmlFileReducer from './commonStores/isoxmlFile'
import visualSettingsReducer from './commonStores/visualSettings'

const store = configureStore({
    reducer: {
        isoxmlFile: isoxmlFileReducer,
        visualSettings: visualSettingsReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['isoxmlFile/loadingDone'],
            },
        }),
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store