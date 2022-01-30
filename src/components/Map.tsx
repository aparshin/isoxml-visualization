import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import {WebMercatorViewport } from '@deck.gl/core'
import DeckGL from '@deck.gl/react'
import {BASEMAP} from '@deck.gl/carto'
import { InitialViewStateProps } from '@deck.gl/core/lib/deck'
import {StaticMap} from 'react-map-gl'
import { ExtendedGrid, Task } from 'isoxml';
import { gridsVisibilitySelector } from '../commonStores/visualSettings';
import { getCurrentISOXMLManager, isoxmlFileGridsInfoSelector } from '../commonStores/isoxmlFile';
import ISOXMLGridLayer from '../mapLayers/GridLayer';
import { fitBoundsSelector } from '../commonStores/map'
import { convertValue, getGridValue } from '../utils'

const useStyles = makeStyles({
    tooltipBase: {
        backgroundColor: 'blue',
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 3,
        transform: 'translate(-50%, -50%)',
    },
    tooltip: {
        backgroundColor: 'white',
        border: '1px solid gray',
        position: 'absolute',
        transform: 'translate(-50%, -120%)',
        padding: 4,
        borderRadius: 4
    }
})

interface TooltipState {
    x: number, 
    y: number,
    value: string
}

export function Map() {
    const [tooltip, setTooltip] = useState<TooltipState>(null)

    const [initialViewState, setInitialViewState] = useState<InitialViewStateProps>({
        longitude: 40.81558,
        latitude: 45.10850,
        zoom: 13
    })

    const fitBounds = useSelector(fitBoundsSelector)
    const visibleGrids = useSelector(gridsVisibilitySelector)
    const gridsInfo = useSelector(isoxmlFileGridsInfoSelector)
    const isoxmlManager = getCurrentISOXMLManager()
    const layers = Object.keys(visibleGrids)
        .filter(taskId => visibleGrids[taskId])
        .map(taskId => {
            const task = isoxmlManager.getEntityByXmlId<Task>(taskId)

            return new ISOXMLGridLayer(taskId, task.attributes.Grid[0] as ExtendedGrid, gridsInfo[taskId])
        })

    const viewStateRef = useRef(null)

    const onViewStateChange = useCallback(e => {
        viewStateRef.current = e.viewState 
        setTooltip(null)
    }, [])

    const onMapClick = useCallback(pickInfo => {
        if (!pickInfo.layer || !(pickInfo.layer instanceof ISOXMLGridLayer)) {
            setTooltip(null)
            return
        }
        const pixel = pickInfo.bitmap.pixel
        const taskId = pickInfo.layer.id

        const task = isoxmlManager.getEntityByXmlId<Task>(taskId)

        const grid = task.attributes.Grid[0] as ExtendedGrid

        const value = getGridValue(grid, pixel[0], pixel[1])
        if (value) {
            const gridInfo = gridsInfo[taskId]
            const valueConverted = convertValue(value, gridInfo)
            setTooltip({
                x: pickInfo.x,
                y: pickInfo.y,
                value: `${valueConverted} ${gridInfo.unit}`
            })
        } else {
            setTooltip(null)
        }
    }, [isoxmlManager, gridsInfo])

    useEffect(() => {
        if (fitBounds) {
            const viewport = new WebMercatorViewport(viewStateRef.current)
            const fitBoundsViewport = viewport.fitBounds([fitBounds.slice(0, 2), fitBounds.slice(2, 4)])
            setInitialViewState(fitBoundsViewport)
            setTooltip(null)
        }
    }, [fitBounds])

    const classes = useStyles()

    return (<>
        <DeckGL
            initialViewState={initialViewState}
            controller={true}
            layers={layers}
            onViewStateChange={onViewStateChange}
            onClick={onMapClick}
        >
            <StaticMap mapStyle={BASEMAP.POSITRON} />
        </DeckGL>
        {tooltip && (<>
            <div className={classes.tooltipBase} style={{left: tooltip.x, top: tooltip.y}}/>
            <div className={classes.tooltip} style={{left: tooltip.x, top: tooltip.y}}>
                {tooltip.value}
            </div>
        </>)}
    </>)
}