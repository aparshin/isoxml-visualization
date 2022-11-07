import React from "react"
import Typography from "@mui/material/Typography"
import { ValueInformation } from "isoxml"
import { formatValue } from "../../utils"
import { SxProps } from "@mui/system"
import Box from "@mui/material/Box"

interface ValueDataPaletteProps {
    valueInfo: ValueInformation
    min: number
    max: number
    paletteSx: SxProps
}

export function ValueDataPalette({valueInfo, min, max, paletteSx}: ValueDataPaletteProps) {
    return (<>
        <Box sx={paletteSx}></Box>
        <Box sx={{display: 'flex', fontSize: '0.9rem'}}>
            <Typography variant='body2' sx={{flexGrow: 1}}>{formatValue(min, valueInfo)}</Typography>
            <Typography variant='body2'>{formatValue(max, valueInfo)}</Typography>
        </Box>
    </>)
}
