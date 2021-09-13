import { Grid } from "isoxml"
import { BitmapLayer } from '@deck.gl/layers'
import { gridBounds } from "../utils"

export default class ISOXMLGridLayer {
    constructor(id: string, grid: Grid) {
        const nCols = grid.attributes.GridMaximumColumn
        const nRows = grid.attributes.GridMaximumRow

        const bounds = gridBounds(grid)

        const canvas = document.createElement('canvas')
        canvas.width = nCols
        canvas.height = nRows

        const ctx = canvas.getContext('2d')
        ctx.beginPath();
        ctx.fillStyle = '#0f0'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.closePath()

        return new BitmapLayer({
            id,
            bounds,
            image: Promise.resolve(canvas) // TODO: remove promise after https://github.com/visgl/deck.gl/issues/6192 is fixed
        })
    }
}