import React, { useMemo } from "react"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import chroma from "chroma-js"
import { ValueInformation } from "isoxml"

import { backgroundGradientFromPalette, formatValue } from "../../utils"

interface ValueDataPaletteProps {
    valueInfo: ValueInformation
    min: number
    max: number
    palette?: chroma.Scale<chroma.Color>
}

/** This component renders the palette as a bar and max/min labels under the palette.
 * If max = min, the last color from the palette is shown.
*/
export function ValueDataPalette({valueInfo, min, max, palette}: ValueDataPaletteProps) {
    const paletteSx = useMemo(() => {
        if (!palette) {
            return {}
        }
        const paletteColors = palette.colors(undefined)
        const actualPalette = min === max
            ? chroma.scale([paletteColors[paletteColors.length - 1]])
            : palette
        return {
            height: '16px',
            background: backgroundGradientFromPalette(actualPalette)
        }
    }, [min, max, palette])
    return (<>
        <Box sx={paletteSx}></Box>
        <Box sx={{display: 'flex', fontSize: '0.9rem'}}>
            <Typography variant='body2' sx={{flexGrow: 1}}>{formatValue(min, valueInfo)}</Typography>
            {min !== max && (
                <Typography variant='body2'>{formatValue(max, valueInfo)}</Typography>
            )}
        </Box>
    </>)
}
