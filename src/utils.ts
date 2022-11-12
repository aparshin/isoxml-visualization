import { ExtentsLeftBottomRightTop } from "@deck.gl/core/utils/positions";
import chroma from "chroma-js";
import { ExtendedGrid, ExtendedTreatmentZone, Grid, GridGridTypeEnum, ValueInformation } from "isoxml";

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

export function calculateGridValuesRange (
    grid: ExtendedGrid,
    treatmentZones: ExtendedTreatmentZone[]
): {min: number, max: number} {

    let min = +Infinity
    let max = -Infinity

    if (grid.attributes.GridType === GridGridTypeEnum.GridType1) {
        const zoneCodes = grid.getAllReferencedTZNCodes()

        zoneCodes.forEach(zoneCode => {
            const zone = treatmentZones.find(z => z.attributes.TreatmentZoneCode === zoneCode)
            const pdv = zone?.attributes.ProcessDataVariable?.[0]

            if (pdv) {
                const value = pdv.attributes.ProcessDataValue

                min = Math.min(min, value)
                max = Math.max(max, value)
            }
        })
    } else {
        const nCols = grid.attributes.GridMaximumColumn
        const nRows = grid.attributes.GridMaximumRow
        const cells = new Int32Array(grid.binaryData.buffer)

        for (let idx = 0; idx < nRows * nCols; idx++) {
            const v = cells[idx]
            if (v) {
                min = Math.min(min, cells[idx])
                max = Math.max(max, cells[idx])
            }
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

export const formatValue = (value: number, valueDescription: ValueInformation): string => {
    const scaledValue = value * valueDescription.scale + valueDescription.offset
    return `${scaledValue.toFixed(valueDescription.numberOfDecimals)} ${valueDescription.unit}`
}

export function backgroundGradientFromPalette (scale: chroma.Scale) {
  const len = 10
  const stops = scale.colors(len, null).map((color, idx) => {
    return `${color.css()} ${idx / (len - 1) * 100}%`
  })
  return `linear-gradient(90deg,${stops.join(',')})`
}