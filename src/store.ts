import { configureStore } from '@reduxjs/toolkit'
import isoxmlFileReducer from './commonStores/isoxmlFile'

export default configureStore({
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