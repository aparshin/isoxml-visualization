import { GeoJsonLayer } from "@deck.gl/layers";

export default class PartfieldLayer<D> extends GeoJsonLayer<D>{
    constructor(partfieldId: string, geoJSON: any) {
        super({
            id: partfieldId,
            data: geoJSON,
            getFillColor: [255, 0, 255, 20],
            stroked: true,
            getLineColor: [255, 0, 255],
            getLineWidth: 2,
            lineWidthUnits: 'pixels'
        })
    }
}
