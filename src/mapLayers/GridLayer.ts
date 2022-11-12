import GL from '@luma.gl/constants'
import { BitmapLayer } from '@deck.gl/layers'
import { ExtendedGrid, GridGridTypeEnum, TreatmentZone } from "isoxml"
import { gridBounds, GRID_COLOR_SCALE } from "../utils"
import chroma from 'chroma-js'

export default class ISOXMLGridLayer extends BitmapLayer<unknown>{
    constructor(
        id: string,
        grid: ExtendedGrid,
        treatmentZones: TreatmentZone[],
        range: {min: number, max: number}
    ) {
        const nCols = grid.attributes.GridMaximumColumn
        const nRows = grid.attributes.GridMaximumRow

        const bounds = gridBounds(grid)

        const canvas = document.createElement('canvas')
        canvas.width = nCols
        canvas.height = nRows

        const palette = chroma.scale((GRID_COLOR_SCALE.colors as any)()).domain([range.min, range.max])

        const ctx = canvas.getContext('2d')
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        if (grid.attributes.GridType === GridGridTypeEnum.GridType1) {
            const valueTable: {[code: number]: number | undefined} = {}

            treatmentZones.forEach(zone => {
                const code = zone.attributes.TreatmentZoneCode
                const value = zone.attributes.ProcessDataVariable?.[0]?.attributes.ProcessDataValue

                valueTable[code] = value
            })

            const cells = new Uint8Array(grid.binaryData.buffer)

            for (let y = 0; y < nRows; y++) {
                for (let x = 0; x < nCols; x++) {
                    const code = cells[y * nCols + x]
                    const value = valueTable[code]
                    if (value === 0 || value === undefined) {
                        continue
                    }
                    const color = palette(value).rgba()
                    const idx = 4 * ((nRows - y - 1) * nCols + x)

                    imageData.data[idx + 0] = color[0]
                    imageData.data[idx + 1] = color[1]
                    imageData.data[idx + 2] = color[2]
                    imageData.data[idx + 3] = 255
                }
            }

        } else {
            const cells = new Int32Array(grid.binaryData.buffer)

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