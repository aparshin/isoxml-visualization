import React, { useCallback, useEffect, useRef, useState } from 'react'
import { WebMercatorViewport } from '@deck.gl/core'
import DeckGL from '@deck.gl/react'
import {StaticMap} from 'react-map-gl'
import {BASEMAP} from '@deck.gl/carto'
import { gridsVisibilitySelector } from '../commonStores/visualSettings';
import { getCurrentISOXMLManager, isoxmlFileGridRangesSelector } from '../commonStores/isoxmlFile';
import ISOXMLGridLayer from '../mapLayers/GridLayer';
import { ExtendedGrid, Task } from 'isoxml';
import { fitBoundsSelector } from '../commonStores/map'
import { useSelector } from 'react-redux'

export function Map() {
    const fitBounds = useSelector(fitBoundsSelector)
    const visibleGrids = useSelector(gridsVisibilitySelector)
    const gridRanges = useSelector(isoxmlFileGridRangesSelector)
    const isoxmlManager = getCurrentISOXMLManager()
    const layers = Object.keys(visibleGrids)
        .filter(taskId => visibleGrids[taskId])
        .map(taskId => {
            const task = isoxmlManager.getEntityByXmlId<Task>(taskId)

            return new ISOXMLGridLayer(taskId, task.attributes.Grid[0] as ExtendedGrid, gridRanges[taskId])
        })

    const viewStateRef = useRef(null)

    const onViewStateChange = useCallback(e => {
        viewStateRef.current = e.viewState 
    }, [])

    const [initialViewState, setInitialViewState] = useState({
        longitude: 40.81558,
        latitude: 45.10850,
        zoom: 13
    })

    useEffect(() => {
        if (fitBounds) {
            const viewport = new WebMercatorViewport(viewStateRef.current)
            const fitBoundsViewport = viewport.fitBounds([fitBounds.slice(0, 2), fitBounds.slice(2, 4)])
            setInitialViewState(fitBoundsViewport)
        }
    }, [fitBounds])

    return (
        <DeckGL
            initialViewState={initialViewState}
            controller={true}
            layers={layers}
            onViewStateChange={onViewStateChange}
        >
            <StaticMap mapStyle={BASEMAP.POSITRON} />
        </DeckGL>
    )
}