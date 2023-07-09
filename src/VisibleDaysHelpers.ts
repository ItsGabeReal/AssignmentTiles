import { GestureResponderEvent } from "react-native";
import DateYMD from "./DateYMD";
import { RowPlan } from "../types/v0";
import VisualSettings from "./VisualSettings";
import { getRowPlan } from "./redux/features/rowPlans/rowPlansSlice";
import { Vector2D } from "../types/General";

export type EventTileDimensions = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function getDayRowHeight(rowPlans: RowPlan[], date: DateYMD) {
    const eventTileHeight = VisualSettings.EventTile.mainContainer.height;
    
    const rowPlan = getRowPlan(rowPlans, date);
    

    let eventContainerHeight;
    if (!rowPlan || rowPlan.orderedEventIDs.length == 0) {
        eventContainerHeight = eventTileHeight;
    }
    else {
        const verticalSpaceBetweenTiles = VisualSettings.EventTile.mainContainer.marginBottom;
        const numTileRows = Math.ceil(rowPlan.orderedEventIDs.length / VisualSettings.DayRow.numEventTileColumns);
        eventContainerHeight = eventTileHeight * numTileRows + verticalSpaceBetweenTiles * (numTileRows - 1);
    }

    const topAndBottomMargin = VisualSettings.DayRow.flatListContainer.paddingTop + VisualSettings.EventTile.mainContainer.marginBottom;

    return (eventContainerHeight + topAndBottomMargin);
}

export function getDayRowYOffset(visibleDays: DateYMD[], rowPlans: RowPlan[], visibleDaysIndex: number) {
    const rowsAbove = visibleDaysIndex;
    const spaceBetweenRows = VisualSettings.App.dayRowSeparater.height;
    let sumOfDayRowHeights = 0;
    for (let i = 0; i < rowsAbove; i++) {
        sumOfDayRowHeights += getDayRowHeight(rowPlans, visibleDays[i]);
    }

    return (sumOfDayRowHeights + spaceBetweenRows * rowsAbove);
}

export function getDayRowScreenYOffset(visibleDays: DateYMD[], rowPlans: RowPlan[], scrollYOffset: number, visibleDaysIndex: number) {
    return getDayRowYOffset(visibleDays, rowPlans, visibleDaysIndex) - scrollYOffset;
}

export function getDayRowAtScreenPosition(visibleDays: DateYMD[], rowPlans: RowPlan[], scrollYOffset: number, screenPosition: { x: number, y: number }) {
    for (let i = 0; i < visibleDays.length; i++) {
        const rowScreenYOffset = getDayRowScreenYOffset(visibleDays, rowPlans, scrollYOffset, i);
        const rowHeight = getDayRowHeight(rowPlans, visibleDays[i]);
        if (screenPosition.y < rowScreenYOffset + rowHeight) {
            return visibleDays[i];
        }
    }

    return null;
}

function getDimensionsForAllTilesInRow(visibleDays: DateYMD[], rowPlans: RowPlan[], scrollYOffset: number, visibleDaysIndex: number) {
    const rowYOffset = getDayRowScreenYOffset(visibleDays, rowPlans, scrollYOffset, visibleDaysIndex);

    const rowPlan = getRowPlan(rowPlans, visibleDays[visibleDaysIndex]);
    if (!rowPlan) return [];
    
    const outputDimensions: EventTileDimensions[] = [];
    for (let i = 0; i < rowPlan.orderedEventIDs.length; i++) {
        outputDimensions[i] = getEventTileDimensions(rowYOffset, i);
    }

    return outputDimensions;
}

export function getEventTileDimensions(rowYOffset: number, eventRowOrder: number) {
    const tilesToTheLeft = eventRowOrder % VisualSettings.DayRow.numEventTileColumns;
    const tilesAbove = Math.floor(eventRowOrder / VisualSettings.DayRow.numEventTileColumns);

    const xPosition = (VisualSettings.DayRow.dateTextContainer.width
        + VisualSettings.DayRow.flatListContainer.paddingLeft
        + tilesToTheLeft * (VisualSettings.EventTile.mainContainer.width + VisualSettings.EventTile.mainContainer.marginRight));

    const yPosition = (rowYOffset
        + VisualSettings.DayRow.flatListContainer.paddingTop
        + tilesAbove * (VisualSettings.EventTile.mainContainer.height + VisualSettings.EventTile.mainContainer.marginBottom));

    const outputDimensions: EventTileDimensions = {
        x: xPosition,
        y: yPosition,
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
    }

    return outputDimensions;
}

export function getInsertionIndexFromGesture(visibleDays: DateYMD[], rowPlans: RowPlan[], scrollYOffset: number, visibleDaysIndex: number, position: Vector2D) {
    const dimensionsForAllTiles = getDimensionsForAllTilesInRow(visibleDays, rowPlans, scrollYOffset, visibleDaysIndex);
    
    for (let i = 0; i < dimensionsForAllTiles.length; i++) {
        const tileDimensions = dimensionsForAllTiles[i];

        // Intermediate variables
        const tileRightEdgePlusMargin = tileDimensions.x + tileDimensions.width + VisualSettings.EventTile.mainContainer.marginRight;
        const tileYMargin = VisualSettings.EventTile.mainContainer.marginBottom;
        const isFirstInRow = (i % VisualSettings.DayRow.numEventTileColumns) === 0;
        
        // Overlap checks
        const gestureYOverlapsTile = position.y > tileDimensions.y - tileYMargin && position.y < tileDimensions.y + tileDimensions.width + tileYMargin;
        const gestureXOverlapsTile = position.x > tileDimensions.x && position.x < tileRightEdgePlusMargin;
        
        // Return insert index
        if (gestureYOverlapsTile) {
            if (gestureXOverlapsTile) {
                return i;
            }
            else if (isFirstInRow && (position.x < tileDimensions.x)) {
                return i;
            }
        }
    }

    // Default return case
    const nextArrayIndex = dimensionsForAllTiles.length;
    return nextArrayIndex;
}