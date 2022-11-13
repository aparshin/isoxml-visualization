import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Grid } from "isoxml";

import { isoxmlFileGridInfoSelector } from "../../commonStores/isoxmlFile";
import { backgroundGradientFromPalette, gridBounds, GRID_COLOR_SCALE } from "../../utils";
import { gridVisibilitySelector, setGridVisibility } from "../../commonStores/visualSettings";
import { fitBounds } from "../../commonStores/map";
import { AppDispatch, RootState } from "../../store";

import { EntityTitle } from "./EntityTitle";
import { ValueDataPalette } from "./ValueDataPalette";

interface GridEntityProps {
    gridId: string
    grid: Grid
}

const BACKGROUND_GRADIENT = backgroundGradientFromPalette(GRID_COLOR_SCALE)

export function GridEntity({grid, gridId}: GridEntityProps) {
    const dispatch: AppDispatch = useDispatch()

    const isVisible = useSelector((state: RootState) => gridVisibilitySelector(state, gridId))
    const gridInfo = useSelector((state: RootState) => isoxmlFileGridInfoSelector(state, gridId))

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
            <Box sx={{pb: 4}}>
                <Typography sx={{fontStyle: 'italic', fontSize: '0.9rem'}}>{gridInfo.DDEntityName}</Typography>
                <ValueDataPalette
                    valueInfo={gridInfo}
                    min={gridInfo.min}
                    max={gridInfo.max}
                    paletteSx={{height: '16px', background: BACKGROUND_GRADIENT}}
                />
            </Box>
        )}
    </>)
}