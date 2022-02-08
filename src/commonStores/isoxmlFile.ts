import { createSlice } from '@reduxjs/toolkit'
import { ValueInformation, ExtendedGrid, ExtendedTask, ISOXMLManager } from 'isoxml'
import { calculateGridValuesRange } from '../utils'
import { clearISOXMLManagerData, getISOXMLManager, setISOXMLManagerData } from './isoxmlFileInfo'

export enum ISOXMLFileState {
    NOT_LOADED,
    LOADING,
    LOADED,
    ERROR
}

export type GridInfo = ValueInformation & {min: number, max: number}

type IsoxmlFileState = {
    state: ISOXMLFileState
    gridsInfo: {[taskId: string]: GridInfo}
}


export const isoxmlFileSlice = createSlice({
    name: 'isoxmlFile',
    initialState: {
        state: ISOXMLFileState.NOT_LOADED,
        gridsInfo: {},
    } as IsoxmlFileState,
    reducers: {
        startLoading: state => {
            state.state = ISOXMLFileState.LOADING
            state.gridsInfo = {}
            clearISOXMLManagerData()
        },

        loadingDone: state => {
            const isoxmlManager = getISOXMLManager()
            state.state = ISOXMLFileState.LOADED
            state.gridsInfo = {}
            ;(isoxmlManager.rootElement.attributes.Task || []).forEach(task => {
                const grid = task.attributes.Grid?.[0]
                const taskXmlId = isoxmlManager.getReferenceByEntity(task).xmlId
                if (grid) {
                    const gridRange = calculateGridValuesRange(grid as ExtendedGrid)
                    const gridValuesDescription = (task as ExtendedTask).getGridValuesDescription()
                    state.gridsInfo[taskXmlId] = {
                        ...gridRange,
                        ...gridValuesDescription[0]
                    }
                }
            })
        },

        loadingError: state => {
            state.state = ISOXMLFileState.ERROR
            state.gridsInfo = {}
            clearISOXMLManagerData()
        },
    },
})

// Action creators are generated for each case reducer function
export const { startLoading, loadingDone, loadingError } = isoxmlFileSlice.actions

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
            setISOXMLManagerData(isoxmlManager, {})
            dispatch(loadingDone())
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
export const isoxmlFileGridsInfoSelector = (state: any): {[taskId: string]: GridInfo} =>
    state.isoxmlFile.gridsInfo