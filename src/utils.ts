import chroma from "chroma-js";
import { Grid } from "isoxml";

export function gridBounds(grid: Grid) {
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


export const GRID_COLOR_SCALE = chroma.scale(chroma.brewer.RdYlGn.slice(0).reverse())