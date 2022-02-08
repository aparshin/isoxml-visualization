import React from "react"
import { makeStyles } from '@material-ui/core/styles'
import Typography from "@material-ui/core/Typography"
import { ValueInformation } from "isoxml"
import { convertValue } from "../../utils"

const useStyles = makeStyles({
    gridRangeContainer: {
        display: 'flex'
    },
    gridRangeMin: {
        flexGrow: 1,
        fontSize: '0.9rem'
    },
    gridRangeMax: {
        fontSize: '0.9rem'
    }
})

interface ValueDataPaletteProps {
    valueInfo: ValueInformation
    min: number
    max: number
    paletteClassName: string
}

export function ValueDataPalette({valueInfo, min, max, paletteClassName}: ValueDataPaletteProps) {
    const classes = useStyles()
    return (<>
        <div className={paletteClassName}></div>
        <div className={classes.gridRangeContainer}>
            <Typography className={classes.gridRangeMin}>{convertValue(min, valueInfo)} {valueInfo.unit}</Typography>
            <Typography className={classes.gridRangeMax}>{convertValue(max, valueInfo)} {valueInfo.unit}</Typography>
        </div>
    </>)
}
