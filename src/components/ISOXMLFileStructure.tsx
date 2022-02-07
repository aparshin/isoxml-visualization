import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VisibilityIcon from '@material-ui/icons/Visibility'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import {
    isoxmlFileGridsInfoSelector,
} from '../commonStores/isoxmlFile'
import { IconButton, MenuItem, Select, Typography } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import {
    gridsVisibilitySelector,
    setGridVisibility,
    setTimeLogDDI,
    setTimeLogVisibility,
    timeLogsSelectedDDISelector,
    timeLogsVisibilitySelector,
    toggleGridVisibility,
    toggleTimeLogVisibility
} from '../commonStores/visualSettings'
import { fitBounds } from '../commonStores/map'
import { DataLogValueInfo, ExtendedTimeLog, Task, ValueInformation } from 'isoxml'
import { convertValue, gridBounds, GRID_COLOR_SCALE } from '../utils'
import chroma from 'chroma-js'
import Tooltip from '@material-ui/core/Tooltip'
import { getISOXMLManager, getTimeLogsCache, parseTimeLog } from '../commonStores/isoxmlFileInfo'

const backgroundGradientFromPalette = (scale: chroma.Scale) => {
  const len = 10
  const stops = scale.colors(len, null).map((color, idx) => {
    return `${color.css()} ${idx / (len - 1) * 100}%`
  })
  return `linear-gradient(90deg,${stops.join(',')})`
}

const useStyles = makeStyles({
    noTasskMessage: {
        textAlign: 'center',
        padding: '8px'
    },
    taskContainer: {
        padding: '8px',
    },
    taskTitle: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    gridContainer: {
        paddingLeft: '16px',
    },
    gridTitleContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    gridTitle: {
        flexGrow: 1
    },
    gridDDInfo: {
        fontStyle: 'italic',
        fontSize: '0.9rem'
    },
    gridPalette: {
        height: 16,
        background: backgroundGradientFromPalette(GRID_COLOR_SCALE)
    },
    gridRangeContainer: {
        display: 'flex'
    },
    gridRangeMin: {
        flexGrow: 1,
        fontSize: '0.9rem'
    },
    gridRangeMax: {
        fontSize: '0.9rem'
    },
    timeLogDDISelect: {
        width: '100%',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },
    entityInfoContainer: {
        paddingBottom: 16
    }
})

interface EntityTitleProps {
    onVisibilityClick: React.MouseEventHandler<HTMLButtonElement>
    onZoomToClick: React.MouseEventHandler<HTMLButtonElement>
    title: string
    entityId: string
    isVisible: boolean
}

function EntityTitle ({onVisibilityClick, onZoomToClick, title, entityId, isVisible}: EntityTitleProps) {
    const classes = useStyles()
    return (
        <div className={classes.gridTitleContainer}>
            <Tooltip title="Toggle visibility on map">
                <IconButton data-entityid={entityId} size="small" onClick={onVisibilityClick}>
                    <VisibilityIcon
                        color={isVisible ? 'primary' : 'disabled'}
                    />
                </IconButton>
            </Tooltip>
            <Typography display="inline" className={classes.gridTitle}>{title}</Typography>
            <Tooltip title="Zoom to entity">
                <IconButton data-entityid={entityId} size="small" onClick={onZoomToClick}>
                    <ZoomInIcon color='primary' />
                </IconButton>
            </Tooltip>
        </div>
    )
}

interface ValueDataPaletteProps {
    valueInfo: ValueInformation
    min: number
    max: number
    hideTitle?: boolean
}

function ValueDataPalette({valueInfo, min, max, hideTitle}: ValueDataPaletteProps) {
    const classes = useStyles()
    return (<>
        {!hideTitle && (
            <Typography className={classes.gridDDInfo}>{valueInfo.DDEntityName}</Typography>
        )}
        <div className={classes.gridPalette}></div>
        <div className={classes.gridRangeContainer}>
            <Typography className={classes.gridRangeMin}>{convertValue(min, valueInfo)} {valueInfo.unit}</Typography>
            <Typography className={classes.gridRangeMax}>{convertValue(max, valueInfo)} {valueInfo.unit}</Typography>
        </div>
    </>)
}

export function ISOXMLFileStructure() {
    const classes = useStyles()

    const isoxmlManager = getISOXMLManager()
    const timeLogCache = getTimeLogsCache()

    const gridsVisibility = useSelector(gridsVisibilitySelector)
    const gridsInfo = useSelector(isoxmlFileGridsInfoSelector)
    const timeLogsVisibility = useSelector(timeLogsVisibilitySelector)
    const timeLogsSelectedDDI = useSelector(timeLogsSelectedDDISelector)

    const dispatch = useDispatch()

    const onGridVisibilityClick = useCallback(e => {
        const gridId = e.currentTarget.dataset.entityid
        dispatch(toggleGridVisibility({gridId}))
    }, [dispatch])

    const onGridZoomToClick = useCallback(e => {
        const gridId = e.currentTarget.dataset.entityid
        const grid = isoxmlManager.getEntityByXmlId<Task>(gridId).attributes.Grid[0]
        dispatch(fitBounds(gridBounds(grid)))
        dispatch(setGridVisibility({gridId, visible: true}))
    }, [dispatch, isoxmlManager])

    const onTimeLogVisibilityClick = useCallback(e => {
        const timeLogId = e.currentTarget.dataset.entityid
        parseTimeLog(timeLogId)
        dispatch(toggleTimeLogVisibility({timeLogId}))
    }, [dispatch])

    const onTimeLogZoomToClick = useCallback(e => {
        const timeLogId = e.currentTarget.dataset.entityid
        parseTimeLog(timeLogId)
        dispatch(fitBounds([...timeLogCache[timeLogId].bbox]))
        dispatch(setTimeLogVisibility({timeLogId, visible: true}))
    }, [dispatch, timeLogCache])

    const onTimeLogDDIChange = useCallback((event, child) => {
        const timeLogId = event.nativeEvent.target.dataset.entityid
        dispatch(setTimeLogDDI({timeLogId, ddi: event.target.value}))
    }, [dispatch])

    const tasks = isoxmlManager.rootElement.attributes.Task

    if (!tasks?.length) {
        return <Typography className={classes.noTasskMessage}>No tasks in this TaskSet</Typography>
    }

    return (<>
        {tasks.map(task => {
            const grid = task.attributes.Grid?.[0]
            const xmlId = isoxmlManager.getReferenceByEntity(task).xmlId
            const gridInfo = gridsInfo[xmlId]

            const timeLogs = (task.attributes.TimeLog || [])
                .filter((timeLog: ExtendedTimeLog) => timeLog.binaryData && timeLog.timeLogInfo)

            return (
                <div key={xmlId} className={classes.taskContainer}>
                    <Typography className={classes.taskTitle}>
                        {task.attributes.TaskDesignator || xmlId}
                    </Typography>
                    {grid && (<div className={classes.gridContainer}>
                        <EntityTitle
                            title={`Grid ${grid.attributes.GridMaximumColumn}x${grid.attributes.GridMaximumRow}`}
                            onVisibilityClick={onGridVisibilityClick}
                            onZoomToClick={onGridZoomToClick}
                            entityId={xmlId}
                            isVisible={!!gridsVisibility[xmlId]}
                        />
                        {gridsVisibility[xmlId] && (
                            <ValueDataPalette valueInfo={gridInfo} min={gridInfo.min} max={gridInfo.max}/>
                        )}
                    </div>)}
                    {timeLogs.map(timeLog => {
                        const timeLogId = timeLog.attributes.Filename

                        let variableValuesInfo: DataLogValueInfo[]
                        let selectedValueInfo: DataLogValueInfo
                        if (timeLogsVisibility[timeLogId]) {
                            variableValuesInfo = timeLogCache[timeLogId].valuesInfo.filter(
                                valueInfo => 'minValue' in valueInfo && valueInfo.minValue !== valueInfo.maxValue
                            )
                            selectedValueInfo = variableValuesInfo
                                .find(info => info.DDIString === timeLogsSelectedDDI[timeLogId])
                        }
                        return (
                            <div key={timeLogId} className={classes.gridContainer}>
                                <EntityTitle
                                    title={`TimeLog ${timeLogId}`}
                                    onVisibilityClick={onTimeLogVisibilityClick}
                                    onZoomToClick={onTimeLogZoomToClick}
                                    entityId={timeLogId}
                                    isVisible={!!timeLogsVisibility[timeLogId]}
                                />
                                {timeLogsVisibility[timeLogId] && variableValuesInfo.length > 0 && (<div className={classes.entityInfoContainer}>
                                    <Select
                                        className={classes.timeLogDDISelect}
                                        value={selectedValueInfo.DDIString}
                                        onChange={onTimeLogDDIChange}
                                    >
                                        {variableValuesInfo.map(valueInfo => (
                                            <MenuItem
                                                key={valueInfo.DDIString}
                                                value={valueInfo.DDIString}
                                                data-entityid={timeLogId}
                                            >
                                                {valueInfo.DDEntityName
                                                    ? `${valueInfo.DDEntityName} (DDI: ${valueInfo.DDIString})`
                                                    : `DDI ${valueInfo.DDIString}`
                                                }
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <ValueDataPalette
                                        valueInfo={selectedValueInfo}
                                        min={selectedValueInfo.minValue}
                                        max={selectedValueInfo.maxValue}
                                        hideTitle={true}
                                    />
                                </div>)}
                            </div>
                        )
                    })}
                </div>
            )
        })}
    </>)
}