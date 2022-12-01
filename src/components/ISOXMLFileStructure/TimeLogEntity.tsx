import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
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

interface TimeLogEntityProps {
    timeLogId: string
}

const renderMenuItem = (valueInfo: DataLogValueInfo) => (
    <MenuItem
        sx={{
            flexDirection: 'column',
            alignItems: 'start',
            color: valueInfo.isProprietary ? '#673ab7': 'initial'
        }}
        key={valueInfo.valueKey}
        value={valueInfo.valueKey}
    >
        <Box sx={{ overflowX: 'hidden', textOverflow: 'ellipsis' }}>{
            valueInfo.DDEntityName
                ? `DDI: 0x${valueInfo.DDIString}\u2002${valueInfo.DDEntityName}`
                : `DDI 0x${valueInfo.DDIString}`
        }</Box>
        <Box sx={{ overflowX: 'hidden', textOverflow: 'ellipsis' }}>
            {valueInfo.deviceElementDesignator || `Device ${valueInfo.deviceElementId}`}
        </Box>
    </MenuItem>
)

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
        const bbox = updatedTimeLogInfo.bbox
        if (bbox.every(pos => isFinite(pos))) {
            dispatch(fitBounds([...updatedTimeLogInfo.bbox]))
        }
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

    const valuesInfo: DataLogValueInfo[] = useMemo(() => {
        if (!isVisible) {
            return []
        }
        const timeLogInfo = getTimeLogInfo(timeLogId)
        return timeLogInfo.valuesInfo.filter(
            valueInfo => 'minValue' in valueInfo
        )

    }, [timeLogId, isVisible])

    const parsingWarnings = getTimeLogInfo(timeLogId)?.parsingErrors || []

    const standardValuesInfo = valuesInfo.filter(valueInfo => !valueInfo.isProprietary)
    const proprietaryValuesInfo = valuesInfo.filter(valueInfo => valueInfo.isProprietary)

    let selectedValueInfo: DataLogValueInfo = null
    let min: number
    let max: number
    if (isVisible && selectedValueKey) {
        selectedValueInfo = valuesInfo.find(info => info.valueKey === selectedValueKey)

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
            warnings={parsingWarnings}
        />
        {isVisible && valuesInfo.length > 0 && selectedValueInfo && (
            <Box sx={{pb: 2}}>
                <FormControl size='small' variant='standard' sx={{width: '100%'}}>
                    <Select
                        sx={{ width: '100%', fontSize: '0.9rem', fontStyle: 'italic' }}
                        value={selectedValueInfo.valueKey}
                        onChange={onValueChange}
                    >
                        {standardValuesInfo.map(renderMenuItem)}
                        {proprietaryValuesInfo.length > 0 && (
                            <ListSubheader>
                                <Divider>
                                    <Typography sx={{my: 2}}>
                                        Proprietary TimeLog values
                                    </Typography>
                                </Divider>
                            </ListSubheader>
                        )}
                        {proprietaryValuesInfo.map(renderMenuItem)}
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
        {isVisible && valuesInfo.length === 0 && (
            <Typography variant='body2' sx={{pb: 2, fontStyle: 'italic'}}>
                No timelog records with valid positions
            </Typography>
        )}
    </>)
}