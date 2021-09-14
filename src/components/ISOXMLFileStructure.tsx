import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VisibilityIcon from '@material-ui/icons/Visibility'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import { getCurrentISOXMLManager, isoxmlFileGridRangesSelector } from '../commonStores/isoxmlFile'
import { IconButton } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { gridsVisibilitySelector, setGridVisibility, toggleGridVisibility } from '../commonStores/visualSettings'
import { fitBounds } from '../commonStores/map'
import { Task } from 'isoxml'
import { gridBounds, GRID_COLOR_SCALE } from '../utils'
import chroma from 'chroma-js'
import Tooltip from '@material-ui/core/Tooltip'

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

export function ISOXMLFileStructure() {
    const classes = useStyles()
    const isoxmlManager = getCurrentISOXMLManager()

    const dispatch = useDispatch()
    const onGridVisibilityClick = useCallback(e => {
        const gridId = e.currentTarget.dataset.gridid
        dispatch(toggleGridVisibility({gridId}))
    }, [dispatch])

    const onGridZoomToClick = useCallback(e => {
        const gridId = e.currentTarget.dataset.gridid
        const grid = isoxmlManager.getEntityByXmlId<Task>(gridId).attributes.Grid[0]
        dispatch(fitBounds(gridBounds(grid)))
        dispatch(setGridVisibility({gridId, visible: true}))
    }, [dispatch, isoxmlManager])

    const tasks = isoxmlManager.rootElement.attributes.Task

    const gridsVisibility = useSelector(gridsVisibilitySelector)
    const gridRanges = useSelector(isoxmlFileGridRangesSelector)

    if (tasks.length === 0) {
        return <div>No tasks in this TaskSet</div>
    }

    return (<>
        {tasks.map(task => {
            const grid = task.attributes.Grid?.[0]
            const xmlId = isoxmlManager.getReferenceByEntity(task).xmlId

            return (
                <div  key={xmlId} className={classes.taskContainer}>
                    <div className={classes.taskTitle}>
                        {task.attributes.TaskDesignator || xmlId}
                    </div>
                    {grid && (<div className={classes.gridContainer}>
                        <div className={classes.gridTitleContainer}>
                            <Tooltip title="Toggle visibility on map">
                                <IconButton data-gridid={xmlId} size="small" onClick={onGridVisibilityClick}>
                                    <VisibilityIcon
                                        color={!!gridsVisibility[xmlId] ? 'primary' : 'disabled'}
                                    />
                                </IconButton>
                            </Tooltip>
                            <span className={classes.gridTitle}>
                                Grid {grid.attributes.GridMaximumColumn}x{grid.attributes.GridMaximumRow}
                            </span>
                            <Tooltip title="Zoom to grid">
                                <IconButton data-gridid={xmlId} size="small" onClick={onGridZoomToClick}>
                                    <ZoomInIcon color='primary' />
                                </IconButton>
                            </Tooltip>
                        </div>
                        {gridsVisibility[xmlId] && (<>
                            <div className={classes.gridPalette}></div>
                            <div className={classes.gridRangeContainer}>
                                <div className={classes.gridRangeMin}>{gridRanges[xmlId].min}</div>
                                <div className={classes.gridRangeMax}>{gridRanges[xmlId].max}</div>
                            </div>
                        </>)}
                    </div>)}
                </div>
            )
        })}
    </>)
}