import React from "react";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { SelectInputProps } from "@material-ui/core/Select/SelectInput";
import { makeStyles } from '@material-ui/core/styles'
import { DataLogValueInfo } from "isoxml";
import { backgroundGradientFromPalette, TIMELOG_COLOR_SCALE } from "../../utils";
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
    }
})

interface TimeLogEntityProps {
    timeLogId: string
    isVisible: boolean
    valuesInfo: DataLogValueInfo[]
    selectedValueInfo: DataLogValueInfo
    onVisibilityClick: React.MouseEventHandler<HTMLButtonElement>
    onZoomToClick: React.MouseEventHandler<HTMLButtonElement>
    onTimeLogValueChange: SelectInputProps['onChange']
}

export function TimeLogEntity({
    timeLogId,
    isVisible,
    valuesInfo,
    selectedValueInfo,
    onVisibilityClick,
    onZoomToClick,
    onTimeLogValueChange
}: TimeLogEntityProps) {
    const classes = useStyles()
    return (<>
        <EntityTitle
            title={`TimeLog ${timeLogId}`}
            onVisibilityClick={onVisibilityClick}
            onZoomToClick={onZoomToClick}
            entityId={timeLogId}
            isVisible={isVisible}
        />
        {isVisible && valuesInfo.length > 0 && (
            <div className={classes.entityInfoContainer}>
                <Select
                    className={classes.timeLogValueSelect}
                    value={selectedValueInfo.valueKey}
                    onChange={onTimeLogValueChange}
                >
                    {valuesInfo.map(valueInfo => (
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