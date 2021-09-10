import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VisibilityIcon from '@material-ui/icons/Visibility'
import { getCurrentISOXMLManager } from '../commonStores/isoxmlFile'
import { IconButton } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { gridsVisibilitySelector, toggleGridVisibility } from '../commonStores/visualSettings'

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
        paddingLeft: '16px'
    },
    gridVisibilityIcon: {
        verticalAlign: 'middle',
    },
    gridInfo: {
        verticalAlign: 'middle'
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
                                    className={classes.gridVisibilityIcon}
                                />
                            </IconButton>
                            <span className={classes.gridInfo}>
                                Grid {grid.attributes.GridMaximumColumn}x{grid.attributes.GridMaximumRow}
                            </span>
                        </div>
                    )}
                </div>
            )
        })}
    </>)
}