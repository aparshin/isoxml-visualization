import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import { DataLogValueInfo, ExtendedTimeLog, Task } from 'isoxml'
import {
    gridsVisibilitySelector,
    setGridVisibility,
    setTimeLogValue,
    setTimeLogVisibility,
    timeLogsSelectedValueSelector,
    timeLogsVisibilitySelector,
    toggleGridVisibility,
    toggleTimeLogVisibility
} from '../../commonStores/visualSettings'
import { fitBounds } from '../../commonStores/map'
import { gridBounds } from '../../utils'
import { getISOXMLManager, getTimeLogsCache, parseTimeLog } from '../../commonStores/isoxmlFileInfo'
import {
    isoxmlFileGridsInfoSelector,
} from '../../commonStores/isoxmlFile'
import { GridEntity } from './GridEntity'
import { TimeLogEntity } from './TimeLogEntity'

const useStyles = makeStyles({
    noTasksMessage: {
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
    entityContainer: {
        paddingLeft: '16px',
    },
})

export function ISOXMLFileStructure() {
    const classes = useStyles()

    const isoxmlManager = getISOXMLManager()
    const timeLogCache = getTimeLogsCache()

    const gridsVisibility = useSelector(gridsVisibilitySelector)
    const gridsInfo = useSelector(isoxmlFileGridsInfoSelector)
    const timeLogsVisibility = useSelector(timeLogsVisibilitySelector)
    const timeLogsSelectedValue = useSelector(timeLogsSelectedValueSelector)

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

    const onTimeLogValueChange = useCallback((event) => {
        const parent = event.nativeEvent.path.find(elem => elem.dataset.entityid)
        const timeLogId = parent?.dataset.entityid
        dispatch(setTimeLogValue({timeLogId, valueKey: event.target.value}))
    }, [dispatch])

    const tasks = isoxmlManager.rootElement.attributes.Task

    if (!tasks?.length) {
        return <Typography className={classes.noTasksMessage}>No tasks in this TaskSet</Typography>
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
                    {grid && (
                        <div className={classes.entityContainer}>
                            <GridEntity
                                xmlId={xmlId}
                                grid={grid}
                                gridInfo={gridInfo}
                                isVisible={gridsVisibility[xmlId]}
                                onVisibilityClick={onGridVisibilityClick}
                                onZoomToClick={onGridZoomToClick}
                            />
                        </div>
                    )}
                    {timeLogs.map(timeLog => {
                        const timeLogId = timeLog.attributes.Filename

                        let variableValuesInfo: DataLogValueInfo[]
                        let selectedValueInfo: DataLogValueInfo
                        if (timeLogsVisibility[timeLogId]) {
                            variableValuesInfo = timeLogCache[timeLogId].valuesInfo.filter(
                                valueInfo => 'minValue' in valueInfo && valueInfo.minValue !== valueInfo.maxValue
                            )
                            selectedValueInfo = variableValuesInfo
                                .find(info => info.valueKey === timeLogsSelectedValue[timeLogId])
                        }
                        return (
                            <div key={timeLogId} className={classes.entityContainer}>
                                <TimeLogEntity
                                    timeLogId={timeLogId}
                                    isVisible={!!timeLogsVisibility[timeLogId]}
                                    valuesInfo={variableValuesInfo}
                                    selectedValueInfo={selectedValueInfo}
                                    onVisibilityClick={onTimeLogVisibilityClick}
                                    onZoomToClick={onTimeLogZoomToClick}
                                    onTimeLogValueChange={onTimeLogValueChange}
                                />
                            </div>
                        )
                    })}
                </div>
            )
        })}
    </>)
}