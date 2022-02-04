import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VisibilityIcon from '@material-ui/icons/Visibility'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import {
    isoxmlFileGridsInfoSelector,
} from '../commonStores/isoxmlFile'
import { IconButton } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import {
    gridsVisibilitySelector,
    setGridVisibility,
    setTimeLogVisibility,
    timeLogsVisibilitySelector,
    toggleGridVisibility,
    toggleTimeLogVisibility
} from '../commonStores/visualSettings'
import { fitBounds } from '../commonStores/map'
import { Task } from 'isoxml'
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
        fontStyle: 'italic'
    },
    gridPalette: {
        height: 16,
        background: backgroundGradientFromPalette(GRID_COLOR_SCALE)
    },
    gridRangeContainer: {
        display: 'flex'
    },
    gridRangeMin: {
        flexGrow: 1
    },
    gridRangeMax: {

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
            <span className={classes.gridTitle}>{title}</span>
            <Tooltip title="Zoom to entity">
                <IconButton data-entityid={entityId} size="small" onClick={onZoomToClick}>
                    <ZoomInIcon color='primary' />
                </IconButton>
            </Tooltip>
        </div>
    )
}

export function ISOXMLFileStructure() {
    const classes = useStyles()
    const isoxmlManager = getISOXMLManager()
    const timeLogCache = getTimeLogsCache()

    const gridsVisibility = useSelector(gridsVisibilitySelector)
    const gridsInfo = useSelector(isoxmlFileGridsInfoSelector)

    const timeLogsVisibility = useSelector(timeLogsVisibilitySelector)


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

    const tasks = isoxmlManager.rootElement.attributes.Task

    if (tasks.length === 0) {
        return <div>No tasks in this TaskSet</div>
    }

    return (<>
        {tasks.map(task => {
            const grid = task.attributes.Grid?.[0]
            const xmlId = isoxmlManager.getReferenceByEntity(task).xmlId
            const gridInfo = gridsInfo[xmlId]

            const timeLogs = task.attributes.TimeLog || []

            return (
                <div key={xmlId} className={classes.taskContainer}>
                    <div className={classes.taskTitle}>
                        {task.attributes.TaskDesignator || xmlId}
                    </div>
                    {grid && (<div className={classes.gridContainer}>
                        <EntityTitle
                            title={`Grid ${grid.attributes.GridMaximumColumn}x${grid.attributes.GridMaximumRow}`}
                            onVisibilityClick={onGridVisibilityClick}
                            onZoomToClick={onGridZoomToClick}
                            entityId={xmlId}
                            isVisible={!!gridsVisibility[xmlId]}
                        />
                        {gridsVisibility[xmlId] && (<>
                            <div className={classes.gridDDInfo}>{gridInfo.name}</div>
                            <div className={classes.gridPalette}></div>
                            <div className={classes.gridRangeContainer}>
                                <div className={classes.gridRangeMin}>{convertValue(gridInfo.min, gridInfo)} {gridInfo.unit}</div>
                                <div className={classes.gridRangeMax}>{convertValue(gridInfo.max, gridInfo)} {gridInfo.unit}</div>
                            </div>
                        </>)}
                    </div>)}
                    {timeLogs.map(timeLog => (
                        <EntityTitle
                            title={`TimeLog ${timeLog.attributes.Filename}`}
                            key={timeLog.attributes.Filename}
                            onVisibilityClick={onTimeLogVisibilityClick}
                            onZoomToClick={onTimeLogZoomToClick}
                            entityId={timeLog.attributes.Filename}
                            isVisible={!!timeLogsVisibility[timeLog.attributes.Filename]}
                        />
                    ))}
                </div>
            )
        })}
    </>)
}