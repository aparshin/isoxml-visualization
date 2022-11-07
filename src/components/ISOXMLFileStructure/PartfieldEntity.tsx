import { ExtendedPartfield } from "isoxml";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch } from "../../store";
import { getPartfieldGeoJSON } from "../../commonStores/isoxmlFileInfo";
import { fitBounds } from "../../commonStores/map";
import { partfieldVisibilitySelector, setPartfieldVisibility } from "../../commonStores/visualSettings";
import { EntityTitle } from "./EntityTitle";

interface PartfieldEntityProps {
    partfieldId: string
    partfield: ExtendedPartfield
}

export function PartfieldEntity({partfield, partfieldId}: PartfieldEntityProps) {
    const dispatch: AppDispatch = useDispatch()

    const isVisible = useSelector(state => partfieldVisibilitySelector(state, partfieldId))

    const onVisibilityClick = useCallback(() => {
        dispatch(setPartfieldVisibility({partfieldId, visible: !isVisible}))
    }, [dispatch, partfieldId, isVisible])

    const onZoomToClick = useCallback(() => {
        const partfieldGeoJSON = getPartfieldGeoJSON(partfieldId)
        dispatch(fitBounds(partfieldGeoJSON.bbox))
        dispatch(setPartfieldVisibility({partfieldId, visible: true}))
    }, [dispatch, partfieldId])

    return (
        <EntityTitle
            title={`Field ${partfield.attributes.PartfieldDesignator || partfield}`}
            isVisible={isVisible}
            onVisibilityClick={onVisibilityClick}
            onZoomToClick={onZoomToClick}
        />
    )
}
