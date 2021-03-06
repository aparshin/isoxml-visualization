import GL from '@luma.gl/constants'
import { BitmapLayer } from '@deck.gl/layers'
import { ExtendedGrid } from "isoxml"
import { gridBounds, GRID_COLOR_SCALE } from "../utils"
import chroma from 'chroma-js'

export default class ISOXMLGridLayer extends BitmapLayer<unknown>{
    constructor(id: string, grid: ExtendedGrid, range: {min: number, max: number}) {
        const nCols = grid.attributes.GridMaximumColumn
        const nRows = grid.attributes.GridMaximumRow

        const bounds = gridBounds(grid)

        const canvas = document.createElement('canvas')
        canvas.width = nCols
        canvas.height = nRows

        const cells = new Int32Array(grid.binaryData.buffer)

        const palette = chroma.scale((GRID_COLOR_SCALE.colors as any)()).domain([range.min, range.max])

        const ctx = canvas.getContext('2d')
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        for (let y = 0; y < nRows; y++) {
            for (let x = 0; x < nCols; x++) {
                const v = cells[y * nCols + x]
                if (v === 0) {
                    continue
                }
                const color = palette(v).rgba()
                const idx = 4 * ((nRows - y - 1) * nCols + x)

                imageData.data[idx + 0] = color[0]
                imageData.data[idx + 1] = color[1]
                imageData.data[idx + 2] = color[2]
                imageData.data[idx + 3] = 255
            }
        }

        ctx.putImageData(imageData, 0, 0)

        super({
            id,
            bounds,
            image: canvas,
            textureParameters: {
                [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
            },
            pickable: true
        })
    }
}