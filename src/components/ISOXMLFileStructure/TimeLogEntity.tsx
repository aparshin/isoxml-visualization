import React, { useCallback } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from '@material-ui/core/styles'
import { DataLogValueInfo } from "isoxml";
import { backgroundGradientFromPalette, TIMELOG_COLOR_SCALE } from "../../utils";
import { EntityTitle } from "./EntityTitle";
import { ValueDataPalette } from "./ValueDataPalette";
import { getTimeLogInfo, parseTimeLog } from "../../commonStores/isoxmlFileInfo";
import { useDispatch, useSelector } from "react-redux";
import {
    setTimeLogValue,
    setTimeLogVisibility,
    timeLogSelectedValueSelector,
    timeLogVisibilitySelector,
    toggleTimeLogVisibility
} from "../../commonStores/visualSettings";
import { fitBounds } from "../../commonStores/map";

const useStyles = makeStyles({
    timeLogPalette: {
        height: 16,
        background: backgroundGradientFromPalette(TIMELOG_COLOR_SCALE)
    },
    timeLogValueSelect: {
        width: '100%',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },
    entityInfoContainer: {
        paddingBottom: 16
    },
    timeLogMenuItem: {
        flexDirection: 'column',
        alignItems: 'start'
    },
    timeLogMenuItemLine: {
        overflowX: 'hidden',
        textOverflow: 'ellipsis'
    }
})

interface TimeLogEntityProps {
    timeLogId: string
}

export function TimeLogEntity({ timeLogId }: TimeLogEntityProps) {
    const classes = useStyles()
    const dispatch = useDispatch()

    const isVisible = useSelector(state => timeLogVisibilitySelector(state, timeLogId))
    const selectedValueKey = useSelector(state => timeLogSelectedValueSelector(state, timeLogId))

    const onVisibilityClick = useCallback(() => {
        parseTimeLog(timeLogId)
        dispatch(toggleTimeLogVisibility({timeLogId}))
    }, [dispatch, timeLogId])

    const onZoomToClick = useCallback(() => {
        parseTimeLog(timeLogId)
        const updatedTimeLogInfo = getTimeLogInfo(timeLogId)
        dispatch(fitBounds([...updatedTimeLogInfo.bbox]))
        dispatch(setTimeLogVisibility({timeLogId, visible: true}))
    }, [dispatch, timeLogId])

    const onValueChange = useCallback((event) => {
        const parent = event.nativeEvent.path.find(elem => elem.dataset.entityid)
        const timeLogId = parent?.dataset.entityid
        dispatch(setTimeLogValue({timeLogId, valueKey: event.target.value}))
    }, [dispatch])

    let variableValuesInfo: DataLogValueInfo[] = []
    let selectedValueInfo: DataLogValueInfo = null
    if (isVisible) {
        const timeLogInfo = getTimeLogInfo(timeLogId)
        variableValuesInfo = timeLogInfo.valuesInfo.filter(
            valueInfo => 'minValue' in valueInfo && valueInfo.minValue !== valueInfo.maxValue
        )
        selectedValueInfo = variableValuesInfo
            .find(info => info.valueKey === selectedValueKey)
    }


    return (<>
        <EntityTitle
            title={`TimeLog ${timeLogId}`}
            onVisibilityClick={onVisibilityClick}
            onZoomToClick={onZoomToClick}
            isVisible={isVisible}
        />
        {isVisible && variableValuesInfo.length > 0 && (
            <div className={classes.entityInfoContainer}>
                <Select
                    className={classes.timeLogValueSelect}
                    value={selectedValueInfo.valueKey}
                    onChange={onValueChange}
                >
                    {variableValuesInfo.map(valueInfo => (
                        <MenuItem
                            className={classes.timeLogMenuItem}
                            key={valueInfo.valueKey}
                            value={valueInfo.valueKey}
                            data-entityid={timeLogId}
                        >
                            <div className={classes.timeLogMenuItemLine}>{
                                valueInfo.DDEntityName
                                    ? `${valueInfo.DDEntityName} (DDI: ${valueInfo.DDIString})`
                                    : `DDI ${valueInfo.DDIString}`
                            }</div>
                            <div className={classes.timeLogMenuItemLine}>
                                {valueInfo.deviceElementDesignator || `Device ${valueInfo.deviceElementId}`}
                            </div>
                        </MenuItem>
                    ))}
                </Select>
                <ValueDataPalette
                    valueInfo={selectedValueInfo}
                    min={selectedValueInfo.minValue}
                    max={selectedValueInfo.maxValue}
                    paletteClassName={classes.timeLogPalette}
                />
            </div>
        )}
    </>)
}