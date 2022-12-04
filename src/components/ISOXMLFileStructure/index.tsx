import React from 'react'
import Accordion from '@mui/material/Accordion'
import Typography from '@mui/material/Typography'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ExtendedPartfield, ExtendedTimeLog } from 'isoxml'
import { getISOXMLManager } from '../../commonStores/isoxmlFileInfo'
import { GridEntity } from './GridEntity'
import { TimeLogEntity } from './TimeLogEntity'
import { PartfieldEntity } from './PartfieldEntity'

export function ISOXMLFileStructure() {

    const isoxmlManager = getISOXMLManager()

    const tasks = isoxmlManager.rootElement.attributes.Task

    if (!tasks?.length) {
        return <Typography sx={{textAlign: 'center', p: 2}}>No tasks in this TaskSet</Typography>
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
                <Accordion
                    defaultExpanded={tasks.length === 1}
                    key={taskId}
                    disableGutters elevation={0}
                    sx={{
                        '&:before': {
                            display: 'none',
                        }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                            sx={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}
                        >
                            {task.attributes.TaskDesignator || taskId}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {isPartfieldWithGeom && (
                            <Box sx={{pl: 2}}>
                                <PartfieldEntity
                                    partfield={partfield}
                                    partfieldId={partfieldId}
                                />
                            </Box>
                        )}
                        {grid && (
                            <Box sx={{pl: 2}}>
                                <GridEntity
                                    gridId={taskId}
                                    grid={grid}
                                />
                            </Box>
                        )}
                        {timeLogs.map(timeLog => {
                            const timeLogId = timeLog.attributes.Filename
                            return (
                                <Box sx={{pl: 2}} key={timeLogId}>
                                    <TimeLogEntity timeLogId={timeLogId} />
                                </Box>
                            )
                        })}
                    </AccordionDetails>
                </Accordion>
            )
        })}
    </>)
}