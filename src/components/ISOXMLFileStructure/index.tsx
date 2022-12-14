import React, { MouseEvent, useMemo, MouseEventHandler } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Accordion from '@mui/material/Accordion'
import Typography from '@mui/material/Typography'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MergeIcon from '@mui/icons-material/Merge';
import IconButton from '@mui/material/IconButton'
import { ExtendedPartfield } from 'isoxml'
import { getISOXMLManager } from '../../commonStores/isoxmlFileInfo'
import { mergeTimeLogsSelector, toggleMergeTimeLogs } from '../../commonStores/visualSettings'
import { AppDispatch } from '../../store'
import { getTimeLogsWithData } from '../../utils'
import { GridEntity } from './GridEntity'
import { TimeLogEntity } from './TimeLogEntity'
import { PartfieldEntity } from './PartfieldEntity'

export function ISOXMLFileStructure() {

    const dispatch: AppDispatch = useDispatch()
    const isoxmlManager = getISOXMLManager()

    const mergeTimeLogs = useSelector(mergeTimeLogsSelector)

    const tasks = isoxmlManager.rootElement.attributes.Task

    const handleMergeClickCallbacks = useMemo(() => {
        return tasks.reduce((callbacks, task) => {
            const taskId = isoxmlManager.getReferenceByEntity(task).xmlId
            callbacks[taskId] = (event: MouseEvent<HTMLButtonElement>) => {
                dispatch(toggleMergeTimeLogs({taskId}))
                event.stopPropagation()
            }
            return callbacks
        }, {} as Record<string, MouseEventHandler<HTMLButtonElement>>)
    }, [tasks, isoxmlManager, dispatch])

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

            const timeLogs = getTimeLogsWithData(task)
            const isTimeLogsToMerge = timeLogs.length > 1

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
                    <AccordionSummary
                        sx={{
                            '& .MuiAccordionSummary-content': {
                                minWidth: 0
                            },
                            flexDirection: 'row-reverse'
                        }}
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Box sx={{display: 'flex', minWidth: 0, width: '100%'}}>
                            <Typography
                                sx={{flexGrow: '1', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}
                            >
                                {task.attributes.TaskDesignator || taskId}
                            </Typography>
                            {isTimeLogsToMerge && (
                                <Tooltip
                                    disableInteractive
                                    title={mergeTimeLogs[taskId] ? 'Unmerge TimeLogs' : 'Merge TimeLogs'}
                                >
                                    <IconButton sx={{p: 0.25}} size="small" onClick={handleMergeClickCallbacks[taskId]}>
                                        <MergeIcon
                                            color={mergeTimeLogs[taskId] ? 'primary' : 'disabled'}
                                        />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
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
                        {!mergeTimeLogs[taskId] && timeLogs.map(timeLog => {
                            const timeLogId = timeLog.attributes.Filename
                            return (
                                <Box sx={{pl: 2}} key={timeLogId}>
                                    <TimeLogEntity
                                        timeLogId={timeLogId}
                                        isMergedTimeLog={false}
                                    />
                                </Box>
                            )
                        })}
                        {mergeTimeLogs[taskId] && (
                            <Box sx={{pl: 2}} key={taskId}>
                                <TimeLogEntity
                                    timeLogId={taskId}
                                    isMergedTimeLog={true}
                                />
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            )
        })}
    </>)
}