import { ExtentsLeftBottomRightTop } from "@deck.gl/core/utils/positions";
import chroma from "chroma-js";
import { ExtendedGrid, Grid, ValueInformation } from "isoxml";

export function gridBounds(grid: Grid): ExtentsLeftBottomRightTop {
    const {
        GridMinimumNorthPosition: minLat,
        GridMinimumEastPosition: minLng,
        GridCellEastSize: cellWidth,
        GridCellNorthSize: cellHeight,
        GridMaximumColumn: nCols,
        GridMaximumRow: nRows
    } = grid.attributes

    return [
        minLng,
        minLat,
        minLng + cellWidth * nCols,
        minLat + cellHeight * nRows
    ]
}

export function calculateGridValuesRange (grid: ExtendedGrid): {min: number, max: number} {
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

export function getGridValue(grid: ExtendedGrid, x: number, y: number): number {
    const nCols = grid.attributes.GridMaximumColumn
    const nRows = grid.attributes.GridMaximumRow
    const cells = new Int32Array(grid.binaryData.buffer)

    return cells[(nRows - y - 1) * nCols + x]
}

export const GRID_COLOR_SCALE = chroma.scale(chroma.brewer.RdYlGn.slice(0).reverse())
export const TIMELOG_COLOR_SCALE = chroma.scale(chroma.brewer.RdYlGn.slice(0).reverse())

export const convertValue = (value: number, valueDescription: ValueInformation): number => {
    return value * valueDescription.scale + valueDescription.offset
}