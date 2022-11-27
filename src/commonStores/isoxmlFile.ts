import { createSlice } from '@reduxjs/toolkit'
import { ValueInformation, ExtendedGrid, ExtendedTask, ISOXMLManager } from 'isoxml'
import { RootState } from '../store'
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
    errors: string[]
    warnings: string[]
}


export const isoxmlFileSlice = createSlice({
    name: 'isoxmlFile',
    initialState: {
        state: ISOXMLFileState.NOT_LOADED,
        gridsInfo: {},
        errors: [],
        warnings: []
    } as IsoxmlFileState,
    reducers: {
        startLoading: state => {
            state.state = ISOXMLFileState.LOADING
            state.gridsInfo = {}
            state.errors = []
            state.warnings = []
            clearISOXMLManagerData()
        },

        loadingDone: state => {
            const isoxmlManager = getISOXMLManager()
            state.state = ISOXMLFileState.LOADED
            state.gridsInfo = {}
            state.warnings = isoxmlManager.getWarnings()
            ;(isoxmlManager.rootElement.attributes.Task || []).forEach(task => {
                const grid = task.attributes.Grid?.[0] as ExtendedGrid
                const taskXmlId = isoxmlManager.getReferenceByEntity(task).xmlId
                if (grid) {
                    const gridValuesDescription = (task as ExtendedTask).getGridValuesDescription()
                    const gridRange = calculateGridValuesRange(grid, task.attributes.TreatmentZone || [])
                    state.gridsInfo[taskXmlId] = {
                        ...gridRange,
                        ...gridValuesDescription[0]
                    }
                }
            })
        },

        loadingError: (state, action) => {
            state.state = ISOXMLFileState.ERROR
            state.errors = action.payload.errors
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
            setISOXMLManagerData(isoxmlManager)
            dispatch(loadingDone())
        } catch(e) {
            dispatch(loadingError({errors: [e.toString()]}))
        }
    }

    reader.onerror = () => {
        dispatch(loadingError({errors: [reader.error.toString()]}))
    }

    reader.readAsArrayBuffer(file)
}

// Selectors
export const isoxmlFileStateSelector = (state: RootState) => state.isoxmlFile.state
export const isoxmlFileGridsInfoSelector = (state: RootState): {[taskId: string]: GridInfo} =>
    state.isoxmlFile.gridsInfo
export const isoxmlFileGridInfoSelector = (state: RootState, gridId: string): GridInfo =>
    state.isoxmlFile.gridsInfo[gridId]
export const isoxmlFileWarningsSelector = (state: RootState) => state.isoxmlFile.warnings
export const isoxmlFileErrorsSelector = (state: RootState) => state.isoxmlFile.errors