import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import { ExtendedPartfield, ExtendedTimeLog } from 'isoxml'
import { getISOXMLManager } from '../../commonStores/isoxmlFileInfo'
import { GridEntity } from './GridEntity'
import { TimeLogEntity } from './TimeLogEntity'
import { PartfieldEntity } from './PartfieldEntity'

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

    const tasks = isoxmlManager.rootElement.attributes.Task

    if (!tasks?.length) {
        return <Typography className={classes.noTasksMessage}>No tasks in this TaskSet</Typography>
    }

    return (<>
        {tasks.map(task => {
            const grid = task.attributes.Grid?.[0]
            const taskId = isoxmlManager.getReferenceByEntity(task).xmlId
            const partfieldId = task.attributes.PartfieldIdRef?.xmlId
            const partfield = task.attributes.PartfieldIdRef?.entity as ExtendedPartfield
            const isPartfieldWithGeom = partfield?.attributes.PolygonnonTreatmentZoneonly?.length > 0

            const timeLogs = (task.attributes.TimeLog || [])
                .filter((timeLog: ExtendedTimeLog) => timeLog.binaryData && timeLog.timeLogHeader)

            return (
                <div key={taskId} className={classes.taskContainer}>
                    <Typography className={classes.taskTitle}>
                        {task.attributes.TaskDesignator || taskId}
                    </Typography>
                    {isPartfieldWithGeom && (
                        <div className={classes.entityContainer}>
                            <PartfieldEntity
                                partfield={partfield}
                                partfieldId={partfieldId}
                            />
                        </div>
                    )}
                    {grid && (
                        <div className={classes.entityContainer}>
                            <GridEntity
                                gridId={taskId}
                                grid={grid}
                            />
                        </div>
                    )}
                    {timeLogs.map(timeLog => {
                        const timeLogId = timeLog.attributes.Filename
                        return (
                            <div key={timeLogId} className={classes.entityContainer}>
                                <TimeLogEntity timeLogId={timeLogId} />
                            </div>
                        )
                    })}
                </div>
            )
        })}
    </>)
}