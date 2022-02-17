import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from '@material-ui/core/styles'
import Typography from "@material-ui/core/Typography";
import { Grid } from "isoxml";

import { isoxmlFileGridInfoSelector } from "../../commonStores/isoxmlFile";
import { backgroundGradientFromPalette, gridBounds, GRID_COLOR_SCALE } from "../../utils";
import { gridVisibilitySelector, setGridVisibility } from "../../commonStores/visualSettings";
import { fitBounds } from "../../commonStores/map";

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
    gridId: string
    grid: Grid
}

export function GridEntity({grid, gridId}: GridEntityProps) {
    const classes = useStyles()
    const dispatch = useDispatch()

    const isVisible = useSelector(state => gridVisibilitySelector(state, gridId))
    const gridInfo = useSelector(state => isoxmlFileGridInfoSelector(state, gridId))

    const onVisibilityClick = useCallback(() => {
        dispatch(setGridVisibility({gridId, visible: !isVisible}))
    }, [dispatch, gridId, isVisible])

    const onZoomToClick = useCallback(() => {
        dispatch(fitBounds(gridBounds(grid)))
        dispatch(setGridVisibility({gridId, visible: true}))
    }, [dispatch, grid, gridId])


    return (<>
        <EntityTitle
            title={`Grid ${grid.attributes.GridMaximumColumn}x${grid.attributes.GridMaximumRow}`}
            onVisibilityClick={onVisibilityClick}
            onZoomToClick={onZoomToClick}
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