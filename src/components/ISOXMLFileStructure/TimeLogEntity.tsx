import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import { DataLogValueInfo } from "isoxml";

import { TIMELOG_COLOR_SCALE } from "../../utils";
import { getTimeLogInfo, getTimeLogValuesRange, parseTimeLog } from "../../commonStores/isoxmlFileInfo";
import {
    setExcludeOutliers,
    setFillMissingOutliers,
    setTimeLogValue,
    setTimeLogVisibility,
    timeLogExcludeOutliersSelector,
    timeLogFillMissingValuesSelector,
    timeLogSelectedValueSelector,
    timeLogVisibilitySelector
} from "../../commonStores/visualSettings";
import { fitBounds } from "../../commonStores/map";
import { AppDispatch, RootState } from "../../store";

import { EntityTitle } from "./EntityTitle";
import { ValueDataPalette } from "./ValueDataPalette";
import { Typography } from "@mui/material";

interface TimeLogEntityProps {
    timeLogId: string
}

const TimeLogCheckbox = ({label, checked, onChange}: {
    label: string,
    checked: boolean,
    onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
}) => (
    <FormControlLabel
        sx={{fontSize: '0.9rem'}}
        componentsProps={{typography: {variant: 'body2'}}}
        control={ <Checkbox
            sx={{py: 0.125}}
            checked={checked}
            onChange={onChange}
            color="primary"
            size="small"
        /> }
        label={label}
    />
)

export function TimeLogEntity({ timeLogId }: TimeLogEntityProps) {
    const dispatch: AppDispatch = useDispatch()

    const isVisible = useSelector((state: RootState) => timeLogVisibilitySelector(state, timeLogId))
    const excludeOutliers = useSelector((state: RootState) => timeLogExcludeOutliersSelector(state, timeLogId))
    const fillMissingValues = useSelector((state: RootState) => timeLogFillMissingValuesSelector(state, timeLogId))
    const selectedValueKey = useSelector((state: RootState) => timeLogSelectedValueSelector(state, timeLogId))

    const onVisibilityClick = useCallback(() => {
        parseTimeLog(timeLogId, fillMissingValues)
        dispatch(setTimeLogVisibility({timeLogId, visible: !isVisible}))
    }, [dispatch, timeLogId, isVisible, fillMissingValues])

    const onZoomToClick = useCallback(() => {
        parseTimeLog(timeLogId, fillMissingValues)
        const updatedTimeLogInfo = getTimeLogInfo(timeLogId)
        dispatch(fitBounds([...updatedTimeLogInfo.bbox]))
        dispatch(setTimeLogVisibility({timeLogId, visible: true}))
    }, [dispatch, timeLogId, fillMissingValues])

    const onValueChange = useCallback((event) => {
        dispatch(setTimeLogValue({timeLogId, valueKey: event.target.value}))
    }, [dispatch, timeLogId])

    const onExcludeOutlier = useCallback(event => {
        dispatch(setExcludeOutliers({timeLogId, exclude: event.target.checked}))
    }, [dispatch, timeLogId])

    const onFillMissingValues = useCallback(event => {
        dispatch(setFillMissingOutliers({timeLogId, fill: event.target.checked}))
    }, [dispatch, timeLogId])

    let variableValuesInfo: DataLogValueInfo[] = []
    let selectedValueInfo: DataLogValueInfo = null
    let min: number
    let max: number
    if (isVisible && selectedValueKey) {
        const timeLogInfo = getTimeLogInfo(timeLogId)
        variableValuesInfo = timeLogInfo.valuesInfo.filter(
            valueInfo => 'minValue' in valueInfo
        )

        selectedValueInfo = variableValuesInfo
            .find(info => info.valueKey === selectedValueKey)

        if (selectedValueInfo) {
            const {minValue, maxValue} = getTimeLogValuesRange(timeLogId, selectedValueInfo.valueKey, excludeOutliers)
            min = minValue
            max = maxValue
        }
    }

    return (<>
        <EntityTitle
            title={`TimeLog ${timeLogId}`}
            onVisibilityClick={onVisibilityClick}
            onZoomToClick={onZoomToClick}
            isVisible={isVisible}
        />
        {isVisible && variableValuesInfo.length > 0 && (
            <Box sx={{pb: 2}}>
                <FormControl size='small' variant='standard' sx={{width: '100%'}}>
                    <Select
                        sx={{ width: '100%', fontSize: '0.9rem', fontStyle: 'italic' }}
                        value={selectedValueInfo.valueKey}
                        onChange={onValueChange}
                    >
                        {variableValuesInfo.map(valueInfo => (
                            <MenuItem
                                sx={{ flexDirection: 'column', alignItems: 'start' }}
                                key={valueInfo.valueKey}
                                value={valueInfo.valueKey}
                            >
                                <Box sx={{ overflowX: 'hidden', textOverflow: 'ellipsis' }}>{
                                    valueInfo.DDEntityName
                                        ? `${valueInfo.DDEntityName} (DDI: ${valueInfo.DDIString})`
                                        : `DDI ${valueInfo.DDIString}`
                                }</Box>
                                <Box sx={{ overflowX: 'hidden', textOverflow: 'ellipsis' }}>
                                    {valueInfo.deviceElementDesignator || `Device ${valueInfo.deviceElementId}`}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <ValueDataPalette
                    valueInfo={selectedValueInfo}
                    min={min}
                    max={max}
                    palette={TIMELOG_COLOR_SCALE}
                />
                <TimeLogCheckbox
                    checked={excludeOutliers}
                    onChange={onExcludeOutlier}
                    label="Exclude outliers"
                />
                <TimeLogCheckbox
                    checked={fillMissingValues}
                    onChange={onFillMissingValues}
                    label="Fill missing values"
                />
            </Box>
        )}
        {isVisible && variableValuesInfo.length === 0 && (
            <Typography variant='body2' sx={{pb: 2, fontStyle: 'italic'}}>
                No variable data process values
            </Typography>
        )}
    </>)
}