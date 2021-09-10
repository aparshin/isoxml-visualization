import { createSlice } from '@reduxjs/toolkit'
import { ISOXMLManager } from 'isoxml'

// The reason to keet it out of the store is to avoid non-serializable data in the store
// No parts of this app should modify data in this ISOXMLManager
let isoxmlManager: ISOXMLManager

export enum ISOXMLFileState {
    NOT_LOADED,
    LOADING,
    LOADED,
    ERROR
}

export const isoxmlFileSlice = createSlice({
    name: 'isoxmlFile',
    initialState: {
        state: ISOXMLFileState.NOT_LOADED
    },
    reducers: {
        startLoading: state => {
            state.state = ISOXMLFileState.LOADING
            isoxmlManager = null
        },

        loadingDone: (state, action) => {
            state.state = ISOXMLFileState.LOADED
            isoxmlManager = action.payload
        },

        loadingError: state => {
            state.state = ISOXMLFileState.ERROR
            isoxmlManager = null
        },

        removeFile: state => {
            state.state = ISOXMLFileState.NOT_LOADED
            isoxmlManager = null
        }
    }
})

// Action creators are generated for each case reducer function
export const { startLoading, loadingDone, loadingError, removeFile } = isoxmlFileSlice.actions

export default isoxmlFileSlice.reducer

// Async actions
export const loadFile = (file: File) => async (dispatch: any) => {
    const isoxmlManager = new ISOXMLManager()
    const reader = new FileReader()
    dispatch(startLoading())

    reader.onload = async () => {
        const array = new Uint8Array(reader.result as ArrayBuffer)
        try {
            await isoxmlManager.parseISOXMLFile(array, 'application/zip')
            dispatch(loadingDone(isoxmlManager))
        } catch(e) {
            dispatch(loadingError())
        }
    }

    reader.onerror = () => {
        dispatch(loadingError())
    }

    reader.readAsArrayBuffer(file)
}

// Selectors
export const isoxmlFileStateSelector = (state: any) => state.isoxmlFile.state

export const getCurrentISOXMLManager = () => isoxmlManager