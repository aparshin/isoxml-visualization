import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Grid } from "isoxml";

import { isoxmlFileGridInfoSelector } from "../../commonStores/isoxmlFile";
import { gridBounds, GRID_COLOR_SCALE } from "../../utils";
import { gridVisibilitySelector, setGridVisibility } from "../../commonStores/visualSettings";
import { fitBounds } from "../../commonStores/map";
import { AppDispatch, RootState } from "../../store";

import { EntityTitle } from "./EntityTitle";
import { ValueDataPalette } from "./ValueDataPalette";

interface GridEntityProps {
    gridId: string
    grid: Grid
}

export function GridEntity({grid, gridId}: GridEntityProps) {
    const dispatch: AppDispatch = useDispatch()

    const isVisible = useSelector((state: RootState) => gridVisibilitySelector(state, gridId))
    const gridInfo = useSelector((state: RootState) => isoxmlFileGridInfoSelector(state, gridId))

    const handleVisibilityClick = useCallback(() => {
        dispatch(setGridVisibility({gridId, visible: !isVisible}))
    }, [dispatch, gridId, isVisible])

    const handleZoomToClick = useCallback(() => {
        dispatch(fitBounds(gridBounds(grid)))
        dispatch(setGridVisibility({gridId, visible: true}))
    }, [dispatch, grid, gridId])

    const showPalette = gridInfo.min !== 0 || gridInfo.max !== 0

    return (<>
        <EntityTitle
            title={`Grid ${grid.attributes.GridMaximumColumn}x${grid.attributes.GridMaximumRow}`}
            onVisibilityClick={handleVisibilityClick}
            onZoomToClick={handleZoomToClick}
            isVisible={isVisible}
        />
        {isVisible && (
            <Box sx={{pb: 4}}>
                <Typography sx={{fontStyle: 'italic', fontSize: '0.9rem'}}>{gridInfo.DDEntityName}</Typography>
                <ValueDataPalette
                    valueInfo={gridInfo}
                    min={gridInfo.min}
                    max={gridInfo.max}
                    palette={showPalette ? GRID_COLOR_SCALE : undefined}
                />
            </Box>
        )}
    </>)
}