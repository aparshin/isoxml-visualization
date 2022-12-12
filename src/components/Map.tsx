import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import { WebMercatorViewport } from '@deck.gl/core'
import DeckGL from '@deck.gl/react'
import {GeoJsonLayer } from '@deck.gl/layers'
import { ExtendedGrid, Task } from 'isoxml'
import {
    gridsVisibilitySelector,
    mergeTimeLogsSelector,
    partfieldsVisibilitySelector,
    timeLogsExcludeOutliersSelector,
    timeLogsFillMissingValuesSelector,
    timeLogsSelectedValueSelector,
    timeLogsVisibilitySelector
} from '../commonStores/visualSettings'
import { isoxmlFileGridsInfoSelector } from '../commonStores/isoxmlFile'
import ISOXMLGridLayer from '../mapLayers/GridLayer'
import { fitBoundsSelector } from '../commonStores/map'
import { formatValue, getGridValue } from '../utils'
import { OSMBasemap, OSMCopyright } from '../mapLayers/OSMBaseLayer'
import {
    getISOXMLManager,
    getMergedTimeLogGeoJSON,
    getMergedTimeLogInfo,
    getPartfieldGeoJSON,
    getTaskIdByTimeLogFilename,
    getTaskTimeLogsValuesRange,
    getTimeLogGeoJSON,
    getTimeLogInfo,
    getTimeLogValuesRange,
    isMergedTimeLogId
} from '../commonStores/isoxmlFileInfo'
import TimeLogLayer from '../mapLayers/TimeLogLayer'
import PartfieldLayer from '../mapLayers/PartfieldLayer'

interface TooltipState {
    x: number, 
    y: number,
    value: string,
    layerType: 'grid' | 'timelog',
    layerId: string
    timeLogValueKey?: string
}

export function Map() {
    const [tooltip, setTooltip] = useState<TooltipState>(null)

    const [initialViewState, setInitialViewState] = useState<any>({
        longitude: 9.5777866,
        latitude: 45.5277534,
        zoom: 13
    })

    const isoxmlManager = getISOXMLManager()

    const fitBounds = useSelector(fitBoundsSelector)
    const gridsInfo = useSelector(isoxmlFileGridsInfoSelector)
    const visibleGrids = useSelector(gridsVisibilitySelector)
    const mergeTimeLogs = useSelector(mergeTimeLogsSelector)

    const visibleTimeLogs = useSelector(timeLogsVisibilitySelector)
    const timeLogsSelectedValue = useSelector(timeLogsSelectedValueSelector)
    const timeLogsExcludeOutliers = useSelector(timeLogsExcludeOutliersSelector)
    const timeLogsFillMissingValues = useSelector(timeLogsFillMissingValuesSelector)

    const visiblePartfields = useSelector(partfieldsVisibilitySelector)

    const partfieldLayers = Object.keys(visiblePartfields)
        .filter(key => visiblePartfields[key])
        .map(partfieldId => {
            const geoJSON = getPartfieldGeoJSON(partfieldId)
            return new PartfieldLayer(partfieldId, geoJSON)
        })

    const gridLayers = Object.keys(visibleGrids)
        .filter(taskId => visibleGrids[taskId])
        .map(taskId => {
            const task = isoxmlManager.getEntityByXmlId<Task>(taskId)

            return new ISOXMLGridLayer(
                taskId,
                task.attributes.Grid[0] as ExtendedGrid,
                task.attributes.TreatmentZone,
                gridsInfo[taskId]
            )
        })

    const timeLogLayers = useMemo(() => Object.keys(visibleTimeLogs)
        .filter(key => {
            if (!visibleTimeLogs[key]) {
                return false
            }
            const isMerged = isMergedTimeLogId(key)
            if (isMerged) {
                return mergeTimeLogs[key]
            } else {
                const taskId = getTaskIdByTimeLogFilename(key)
                return !mergeTimeLogs[taskId]
            }
        })
        .flatMap(timeLogId => {
            const valueKey = timeLogsSelectedValue[timeLogId]
            if (!valueKey) {
                return []
            }
            const excludeOutliers = timeLogsExcludeOutliers[timeLogId]
            const fillValues = timeLogsFillMissingValues[timeLogId]
            const isMerged = isMergedTimeLogId(timeLogId)
            const geoJSON = isMerged
                ? getMergedTimeLogGeoJSON(timeLogId, fillValues)
                : getTimeLogGeoJSON(timeLogId, fillValues)

            const { minValue, maxValue } = isMerged
                ? getTaskTimeLogsValuesRange(timeLogId, valueKey, excludeOutliers)
                : getTimeLogValuesRange(timeLogId, valueKey, excludeOutliers)

            return [new TimeLogLayer(timeLogId, geoJSON, valueKey, minValue, maxValue)]
        }),
        [visibleTimeLogs, mergeTimeLogs, timeLogsSelectedValue, timeLogsExcludeOutliers, timeLogsFillMissingValues]
    )
    
    const viewStateRef = useRef(null)

    const onViewStateChange = useCallback(e => {
        viewStateRef.current = e.viewState 
        setTooltip(null)
    }, [])

    const onMapClick = useCallback(pickInfo => {
        if (!pickInfo.layer) {
            setTooltip(null)
            return
        }

        if (pickInfo.layer instanceof ISOXMLGridLayer) {
            const pixel = pickInfo.bitmap.pixel
            const taskId = pickInfo.layer.id

            const task = isoxmlManager.getEntityByXmlId<Task>(taskId)

            const grid = task.attributes.Grid[0] as ExtendedGrid

            const value = getGridValue(grid, pixel[0], pixel[1])
            if (value) {
                const gridInfo = gridsInfo[taskId]
                const formattedValue = formatValue(value, gridInfo)

                setTooltip({
                    x: pickInfo.x,
                    y: pickInfo.y,
                    value: formattedValue,
                    layerType: 'grid',
                    layerId: taskId
                })
            } else {
                setTooltip(null)
            }
        } else if (pickInfo.layer instanceof GeoJsonLayer) {
            const timeLogId = pickInfo.layer.id
            const valueKey = timeLogsSelectedValue[timeLogId]
            const value = pickInfo.object.properties[valueKey]
            const timeLogInfo = isMergedTimeLogId(timeLogId)
                ? getMergedTimeLogInfo(timeLogId).valuesInfo.find(info => info.valueKey === valueKey)
                : getTimeLogInfo(timeLogId).valuesInfo.find(info => info.valueKey === valueKey)

            const formattedValue = formatValue(value, timeLogInfo)
            const tooltipValue = isMergedTimeLogId(timeLogId)
                ? `${pickInfo.object.properties['originalTimeLogId']}: ${formattedValue}`
                : formattedValue

            setTooltip({
                x: pickInfo.x,
                y: pickInfo.y,
                value: tooltipValue,
                layerType: 'timelog',
                layerId: timeLogId,
                timeLogValueKey: valueKey
            })
        } else {
            setTooltip(null)
        }
    }, [isoxmlManager, gridsInfo, timeLogsSelectedValue])

    useEffect(() => {
        if (fitBounds) {
            const viewport = new WebMercatorViewport(viewStateRef.current)
            const {longitude, latitude, zoom} = viewport.fitBounds(
                [fitBounds.slice(0, 2), fitBounds.slice(2, 4)],
                {padding: 8}
            ) as any
            setInitialViewState({
                longitude,
                latitude,
                zoom: Math.min(20, zoom),
                pitch: 0,
                bearing: 0,
                __triggerUpdate: Math.random() // This property is used to force DeckGL to update the viewState
            })
            setTooltip(null)
        }
    }, [fitBounds])

    let isTooltipVisible = false
    if (tooltip) {
        if (tooltip.layerType === 'grid') {
            isTooltipVisible = !!visibleGrids[tooltip.layerId]
        } else {
            isTooltipVisible = !!visibleTimeLogs[tooltip.layerId] &&
                timeLogsSelectedValue[tooltip.layerId] === tooltip.timeLogValueKey
        }
    }

    return (<>
        <DeckGL
            initialViewState={initialViewState}
            controller={true}
            layers={[OSMBasemap, ...gridLayers, ...partfieldLayers, ...timeLogLayers]}
            onViewStateChange={onViewStateChange}
            onClick={onMapClick}
        >
            <OSMCopyright />
            {isTooltipVisible && (<>
                <Box
                    sx={{
                        backgroundColor: 'blue',
                        position: 'absolute',
                        width: 4,
                        height: 4,
                        borderRadius: 3,
                        transform: 'translate(-50%, -50%)',
                    }}
                    style={{left: tooltip.x, top: tooltip.y}}
                />
                <Box
                    sx={{
                        backgroundColor: 'white',
                        border: '1px solid gray',
                        position: 'absolute',
                        transform: 'translate(-50%, -120%)',
                        padding: 2,
                        borderRadius: 2
                    }}
                    style={{left: tooltip.x, top: tooltip.y}}
                >
                    {tooltip.value}
                </Box>
            </>)}
        </DeckGL>
    </>)
}