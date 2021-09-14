import { createSlice } from '@reduxjs/toolkit'
import { ExtendedGrid, ISOXMLManager } from 'isoxml'

// The reason to keet it out of the store is to avoid non-serializable data in the store
// No parts of this app should modify data in this ISOXMLManager
let isoxmlManager: ISOXMLManager

export enum ISOXMLFileState {
    NOT_LOADED,
    LOADING,
    LOADED,
    ERROR
}

const calculateGridValuesRange = (grid: ExtendedGrid): {min: number, max: number} => {
    const nCols = grid.attributes.GridMaximumColumn
    const nRows = grid.attributes.GridMaximumRow
    const cells = new Int32Array(grid.binaryData.buffer)
    let min = +Infinity
    let max = -Infinity

    for (let idx = 0; idx < nRows * nCols; idx++) {
        const v = cells[idx]
        if (v) {
            min = Math.min(min, cells[idx])
            max = Math.max(max, cells[idx])
        }
    }
    return {min, max}
}

export const isoxmlFileSlice = createSlice({
    name: 'isoxmlFile',
    initialState: {
        state: ISOXMLFileState.NOT_LOADED,
        gridRanges: {}
    },
    reducers: {
        startLoading: state => {
            state.state = ISOXMLFileState.LOADING
            state.gridRanges = {}
            isoxmlManager = null
        },

        loadingDone: (state, action) => {
            state.state = ISOXMLFileState.LOADED
            isoxmlManager = action.payload
            state.gridRanges = {};
            (isoxmlManager.rootElement.attributes.Task || []).forEach(task => {
                const grid = task.attributes.Grid?.[0]
                if (grid) {
                    const xmlId = isoxmlManager.getReferenceByEntity(task).xmlId
                    state.gridRanges[xmlId] = calculateGridValuesRange(grid as ExtendedGrid)
                }
            })
        },

        loadingError: state => {
            state.state = ISOXMLFileState.ERROR
            state.gridRanges = {}
            isoxmlManager = null
        },

        removeFile: state => {
            state.state = ISOXMLFileState.NOT_LOADED
            state.gridRanges = {}
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
export const isoxmlFileGridRangesSelector = (state: any) => state.isoxmlFile.gridRanges

export const getCurrentISOXMLManager = () => isoxmlManager