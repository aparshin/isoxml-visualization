import React from "react"
import { makeStyles } from '@material-ui/core/styles'
import IconButton from "@material-ui/core/IconButton"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import VisibilityIcon from '@material-ui/icons/Visibility'
import ZoomInIcon from '@material-ui/icons/ZoomIn'

interface EntityTitleProps {
    onVisibilityClick: React.MouseEventHandler<HTMLButtonElement>
    onZoomToClick: React.MouseEventHandler<HTMLButtonElement>
    title: string
    entityId: string
    isVisible: boolean
}

const useStyles = makeStyles({
    gridTitleContainer: {
        display: 'flex',
        alignItems: 'center'
    },
    gridTitle: {
        flexGrow: 1
    }
})

export function EntityTitle ({onVisibilityClick, onZoomToClick, title, entityId, isVisible}: EntityTitleProps) {
    const classes = useStyles()
    return (
        <div className={classes.gridTitleContainer}>
            <Tooltip title="Toggle visibility on map">
                <IconButton data-entityid={entityId} size="small" onClick={onVisibilityClick}>
                    <VisibilityIcon
                        color={isVisible ? 'primary' : 'disabled'}
                    />
                </IconButton>
            </Tooltip>
            <Typography display="inline" className={classes.gridTitle}>{title}</Typography>
            <Tooltip title="Zoom to entity">
                <IconButton data-entityid={entityId} size="small" onClick={onZoomToClick}>
                    <ZoomInIcon color='primary' />
                </IconButton>
            </Tooltip>
        </div>
    )
}