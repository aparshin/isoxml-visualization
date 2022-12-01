import React, { useState } from "react"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import VisibilityIcon from '@mui/icons-material/Visibility'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import WarningIcon from '@mui/icons-material/Warning'

interface EntityTitleProps {
    onVisibilityClick: React.MouseEventHandler<HTMLButtonElement>
    onZoomToClick: React.MouseEventHandler<HTMLButtonElement>
    title: string
    isVisible: boolean
    warnings?: string[]
}

export function EntityTitle ({onVisibilityClick, onZoomToClick, title, isVisible, warnings}: EntityTitleProps) {
    const [openWarnings, setOpenWarnings] = useState(false)
    const handleOpenWarnings = () => setOpenWarnings(true)
    const handleCloseWarnings = () => setOpenWarnings(false)

    return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Tooltip disableInteractive title="Toggle visibility on map">
                <IconButton sx={{p: 0.25}} size="small" onClick={onVisibilityClick}>
                    <VisibilityIcon
                        color={isVisible ? 'primary' : 'disabled'}
                    />
                </IconButton>
            </Tooltip>
            <Typography display="inline" sx={{flexGrow: 1}}>{title}</Typography>

            {warnings && warnings.length > 0 && (
                <Tooltip disableInteractive title="See parsing warnings">
                    <IconButton sx={{p: 0.25}} size="small" onClick={handleOpenWarnings}>
                        <WarningIcon sx={{width: '18px', height: '18px', color: 'orange'}}/>
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip disableInteractive title="Zoom to entity">
                <IconButton sx={{p: 0.25}} size="small" onClick={onZoomToClick}>
                    <ZoomInIcon color='primary' />
                </IconButton>
            </Tooltip>
            <Dialog
                open={openWarnings}
                onClose={handleCloseWarnings}
                fullWidth={true}
                maxWidth="md"
            >
                <DialogTitle>Warnings</DialogTitle>
                <DialogContent>
                    {warnings?.map((warning, idx) => (
                        <Box key={idx}>{warning}</Box>
                    ))}
                </DialogContent>
            </Dialog>
        </Box>
    )
}