import React from "react";
import { makeStyles } from '@material-ui/core/styles'
import Typography from "@material-ui/core/Typography";
import { Grid } from "isoxml";

import { GridInfo } from "../../commonStores/isoxmlFile";
import { backgroundGradientFromPalette, GRID_COLOR_SCALE } from "../../utils";

import { EntityTitle } from "./EntityTitle";
import { ValueDataPalette } from "./ValueDataPalette";

const useStyles = makeStyles({
    gridContainer: {
        paddingLeft: '16px',
    },
    gridDDInfo: {
        fontStyle: 'italic',
        fontSize: '0.9rem'
    },
    gridPalette: {
        height: 16,
        background: backgroundGradientFromPalette(GRID_COLOR_SCALE)
    },
    entityInfoContainer: {
        paddingBottom: 16
    }
})

interface GridEntityProps {
    xmlId: string
    grid: Grid
    gridInfo: GridInfo
    isVisible: boolean
    onVisibilityClick: React.MouseEventHandler<HTMLButtonElement>
    onZoomToClick: React.MouseEventHandler<HTMLButtonElement>
}

export function GridEntity({grid, xmlId, isVisible, onVisibilityClick, onZoomToClick, gridInfo}: GridEntityProps) {
    const classes = useStyles()
    return (<>
        <EntityTitle
            title={`Grid ${grid.attributes.GridMaximumColumn}x${grid.attributes.GridMaximumRow}`}
            onVisibilityClick={onVisibilityClick}
            onZoomToClick={onZoomToClick}
            entityId={xmlId}
            isVisible={isVisible}
        />
        {isVisible && (
            <div className={classes.entityInfoContainer}>
                <Typography className={classes.gridDDInfo}>{gridInfo.DDEntityName}</Typography>
                <ValueDataPalette
                    valueInfo={gridInfo}
                    min={gridInfo.min}
                    max={gridInfo.max}
                    paletteClassName={classes.gridPalette}
                />
            </div>
        )}
    </>)
}