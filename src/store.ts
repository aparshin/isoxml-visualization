import { configureStore } from '@reduxjs/toolkit'
import isoxmlFileReducer from './commonStores/isoxmlFile'

const store = configureStore({
    reducer: {
        isoxmlFile: isoxmlFileReducer
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