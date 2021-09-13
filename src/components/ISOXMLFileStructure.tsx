import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VisibilityIcon from '@material-ui/icons/Visibility'
import ZoomInIcon from '@material-ui/icons/ZoomIn'
import { getCurrentISOXMLManager } from '../commonStores/isoxmlFile'
import { IconButton } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { gridsVisibilitySelector, setGridVisibility, toggleGridVisibility } from '../commonStores/visualSettings'
import { fitBounds } from '../commonStores/map'
import { Task } from 'isoxml'
import { gridBounds } from '../utils'

const useStyles = makeStyles({
    taskContainer: {
        padding: '8px',
    },
    taskTitle: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    gridInfoContainer: {
        paddingLeft: '16px',
        display: 'flex',
        alignItems: 'center'
    },
    gridInfo: {
        flexGrow: 1
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
                    {grid && (
                        <div className={classes.gridInfoContainer}>
                            <IconButton data-gridid={xmlId} size="small" onClick={onGridVisibilityClick}>
                                <VisibilityIcon
                                    color={!!gridsVisibility[xmlId] ? 'primary' : 'disabled'}
                                />
                            </IconButton>
                            <span className={classes.gridInfo}>
                                Grid {grid.attributes.GridMaximumColumn}x{grid.attributes.GridMaximumRow}
                            </span>
                            <IconButton data-gridid={xmlId} size="small" onClick={onGridZoomToClick}>
                                <ZoomInIcon color='primary' />
                            </IconButton>
                        </div>
                    )}
                </div>
            )
        })}
    </>)
}