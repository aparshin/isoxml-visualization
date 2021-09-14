import chroma from 'chroma-js'
import GL from '@luma.gl/constants'
import { BitmapLayer } from '@deck.gl/layers'
import { ExtendedGrid } from "isoxml"
import { gridBounds } from "../utils"


const SCALE = chroma.brewer.RdYlGn

export default class ISOXMLGridLayer {
    constructor(id: string, grid: ExtendedGrid) {
        const nCols = grid.attributes.GridMaximumColumn
        const nRows = grid.attributes.GridMaximumRow

        const bounds = gridBounds(grid)

        const canvas = document.createElement('canvas')
        canvas.width = nCols
        canvas.height = nRows

        const cells = new Int32Array(grid.binaryData.buffer)
        let minValue = +Infinity
        let maxValue = -Infinity

        for (let idx = 0; idx < nRows * nCols; idx++) {
            const v = cells[idx]
            if (v) {
                minValue = Math.min(minValue, cells[idx])
                maxValue = Math.max(maxValue, cells[idx])
            }
        }

        const palette = chroma.scale(SCALE.slice(0).reverse()).domain([minValue, maxValue])

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

        return new BitmapLayer({
            id,
            bounds,
            image: Promise.resolve(canvas), // TODO: remove promise after https://github.com/visgl/deck.gl/issues/6192 is fixed
              textureParameters: {
                [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
            }
        })
    }
}