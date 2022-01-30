import { createSlice } from '@reduxjs/toolkit'
import { ExtendedGrid, ExtendedTask, ISOXMLManager } from 'isoxml'
import { GridValueDescription } from 'isoxml/dist/types'
import { calculateGridValuesRange } from '../utils'

// The reason to keet it out of the store is to avoid non-serializable data in the store
// No parts of this app should modify data in this ISOXMLManager
let isoxmlManager: ISOXMLManager

export enum ISOXMLFileState {
    NOT_LOADED,
    LOADING,
    LOADED,
    ERROR
}

type GridInfo = GridValueDescription & {min: number, max: number}

type IsoxmlFileState = {
    state: ISOXMLFileState
    gridsInfo: {[taskId: string]: GridInfo}
}

export const isoxmlFileSlice = createSlice({
    name: 'isoxmlFile',
    initialState: {
        state: ISOXMLFileState.NOT_LOADED,
        gridsInfo: {}
    } as IsoxmlFileState,
    reducers: {
        startLoading: state => {
            state.state = ISOXMLFileState.LOADING
            state.gridsInfo = {}
            isoxmlManager = null
        },

        loadingDone: (state, action) => {
            state.state = ISOXMLFileState.LOADED
            isoxmlManager = action.payload
            state.gridsInfo = {};
            (isoxmlManager.rootElement.attributes.Task || []).forEach(task => {
                const grid = task.attributes.Grid?.[0]
                if (grid) {
                    const xmlId = isoxmlManager.getReferenceByEntity(task).xmlId
                    const gridRange = calculateGridValuesRange(grid as ExtendedGrid)
                    const gridValuesDescription = (task as ExtendedTask).getGridValuesDescription()
                    state.gridsInfo[xmlId] = {
                        ...gridRange,
                        ...gridValuesDescription[0]
                    }
                }
            })
        },

        loadingError: state => {
            state.state = ISOXMLFileState.ERROR
            state.gridsInfo = {}
            isoxmlManager = null
        },

        removeFile: state => {
            state.state = ISOXMLFileState.NOT_LOADED
            state.gridsInfo = {}
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
export const isoxmlFileGridsInfoSelector = (state: any): {[taskId: string]: GridInfo} => state.isoxmlFile.gridsInfo

export const getCurrentISOXMLManager = () => isoxmlManager