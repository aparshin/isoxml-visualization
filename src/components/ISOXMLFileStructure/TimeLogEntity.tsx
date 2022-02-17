import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from '@material-ui/core/styles'
import { DataLogValueInfo } from "isoxml";

import { backgroundGradientFromPalette, TIMELOG_COLOR_SCALE } from "../../utils";
import { getTimeLogInfo, getTimeLogValuesRange, parseTimeLog } from "../../commonStores/isoxmlFileInfo";
import {
    setExcludeOutliers,
    setTimeLogValue,
    setTimeLogVisibility,
    timeLogExcludeOutliersSelector,
    timeLogSelectedValueSelector,
    timeLogVisibilitySelector
} from "../../commonStores/visualSettings";
import { fitBounds } from "../../commonStores/map";

import { EntityTitle } from "./EntityTitle";
import { ValueDataPalette } from "./ValueDataPalette";

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
    },
    outlierLabel: {
        '& *': {
            fontSize: '0.9rem'
        }
    }
})

interface TimeLogEntityProps {
    timeLogId: string
}

export function TimeLogEntity({ timeLogId }: TimeLogEntityProps) {
    const classes = useStyles()
    const dispatch = useDispatch()

    const isVisible = useSelector(state => timeLogVisibilitySelector(state, timeLogId))
    const excludeOutliers = useSelector(state => timeLogExcludeOutliersSelector(state, timeLogId))
    const selectedValueKey = useSelector(state => timeLogSelectedValueSelector(state, timeLogId))

    const onVisibilityClick = useCallback(() => {
        parseTimeLog(timeLogId)
        dispatch(setTimeLogVisibility({timeLogId, visible: !isVisible}))
    }, [dispatch, timeLogId, isVisible])

    const onZoomToClick = useCallback(() => {
        parseTimeLog(timeLogId)
        const updatedTimeLogInfo = getTimeLogInfo(timeLogId)
        dispatch(fitBounds([...updatedTimeLogInfo.bbox]))
        dispatch(setTimeLogVisibility({timeLogId, visible: true}))
    }, [dispatch, timeLogId])

    const onValueChange = useCallback((event) => {
        dispatch(setTimeLogValue({timeLogId, valueKey: event.target.value}))
    }, [dispatch, timeLogId])

    const onExcludeOutlier = useCallback(event => {
        dispatch(setExcludeOutliers({timeLogId, exclude: event.target.checked}))
    }, [dispatch, timeLogId])

    let variableValuesInfo: DataLogValueInfo[] = []
    let selectedValueInfo: DataLogValueInfo = null
    let min: number
    let max: number
    if (isVisible) {
        const timeLogInfo = getTimeLogInfo(timeLogId)
        variableValuesInfo = timeLogInfo.valuesInfo.filter(
            valueInfo => 'minValue' in valueInfo && valueInfo.minValue !== valueInfo.maxValue
        )
        selectedValueInfo = variableValuesInfo
            .find(info => info.valueKey === selectedValueKey)

        const {minValue, maxValue} = getTimeLogValuesRange(timeLogId, selectedValueInfo.valueKey, excludeOutliers)
        min = minValue
        max = maxValue
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
                    min={min}
                    max={max}
                    paletteClassName={classes.timeLogPalette}
                />
                <FormControlLabel
                    className={classes.outlierLabel}
                    control={ <Checkbox
                        checked={excludeOutliers}
                        onChange={onExcludeOutlier}
                        color="primary"
                        size="small"
                    /> }
                    label="Exclude outliers"
                />
            </div>
        )}
    </>)
}