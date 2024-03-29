import { GeoJsonLayer } from "@deck.gl/layers";
import chroma from "chroma-js";
import { TIMELOG_COLOR_SCALE } from "../utils";

const OUTLIER_COLOR: [number, number, number] = [255, 0, 255]

export default class TimeLogLayer extends GeoJsonLayer<unknown>{
    constructor(timeLogId: string, geoJSON: any, valueKey: string, minValue: number, maxValue: number) {
        const colors = TIMELOG_COLOR_SCALE.colors(undefined)

         // if we have only one value, use the last value in the palette
        const palette = chroma
            .scale(minValue === maxValue ? [colors[colors.length - 1]] : colors)
            .domain([minValue, maxValue])

        super({
            id: timeLogId,
            data: {
                ...geoJSON,
                features: geoJSON.features.filter(feature => valueKey in feature.properties)
            },
            getFillColor: (point: any) => {
                const value = point.properties[valueKey] as number
                if (value > maxValue || value < minValue) {
                    return OUTLIER_COLOR
                }
                return palette(value).rgb()
            },
            stroked: false,
            updateTriggers: {
                getFillColor: [valueKey, minValue, maxValue]
            },
            pointRadiusUnits: 'pixels',
            getPointRadius: 5,
            pickable: true
        })
    }
}
