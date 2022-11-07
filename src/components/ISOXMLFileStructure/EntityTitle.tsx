import React from "react"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import VisibilityIcon from '@mui/icons-material/Visibility'
import ZoomInIcon from '@mui/icons-material/ZoomIn'

interface EntityTitleProps {
    onVisibilityClick: React.MouseEventHandler<HTMLButtonElement>
    onZoomToClick: React.MouseEventHandler<HTMLButtonElement>
    title: string
    isVisible: boolean
}

export function EntityTitle ({onVisibilityClick, onZoomToClick, title, isVisible}: EntityTitleProps) {
    return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Tooltip title="Toggle visibility on map">
                <IconButton sx={{p: 0.25}} size="small" onClick={onVisibilityClick}>
                    <VisibilityIcon
                        color={isVisible ? 'primary' : 'disabled'}
                    />
                </IconButton>
            </Tooltip>
            <Typography display="inline" sx={{flexGrow: 1}}>{title}</Typography>
            <Tooltip title="Zoom to entity">
                <IconButton sx={{p: 0.25}} size="small" onClick={onZoomToClick}>
                    <ZoomInIcon color='primary' />
                </IconButton>
            </Tooltip>
        </Box>
    )
}