import { GestureResponderEvent } from "react-native";
import DateYMD from "./DateYMD";
import { EventTileDimensions, RowPlan } from "../types/EventTypes";
import VisualSettings from "./VisualSettings";
import { getRowPlan } from "./redux/features/rowPlans/rowPlansSlice";

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

export function getInsertionIndexFromGesture(visibleDays: DateYMD[], rowPlans: RowPlan[], scrollYOffset: number, visibleDaysIndex: number, gesture: GestureResponderEvent) {
    const dimensionsForAllTiles = getDimensionsForAllTilesInRow(visibleDays, rowPlans, scrollYOffset, visibleDaysIndex);
    
    for (let i = 0; i < dimensionsForAllTiles.length; i++) {
        const tileDimeions = dimensionsForAllTiles[i];

        // Intermediate variables
        const tileXMidpoint = tileDimeions.x + tileDimeions.width / 2;
        const eventTileRightEdgePlusMargin = tileDimeions.x + tileDimeions.width + VisualSettings.EventTile.mainContainer.marginRight;

        // Overlap checks
        const pageX = gesture.nativeEvent.pageX;
        const pageY = gesture.nativeEvent.pageY;
        const gestureYOverlapsTile = pageY > tileDimeions.y && pageY < tileDimeions.y + tileDimeions.width;
        const gestureXOverlapsLeftHalf = pageX > tileDimeions.x && pageX < tileXMidpoint;
        const gestureXOverlapsRightHalf = pageX > tileXMidpoint && pageX < eventTileRightEdgePlusMargin;

        // If gesture overlaps with left side, insert to the left
        if (gestureXOverlapsLeftHalf && gestureYOverlapsTile) return i;

        // If gesture overlaps with right side, insert to the right
        if (gestureXOverlapsRightHalf && gestureYOverlapsTile) return (i + 1);
    }

    // Default return case
    const nextArrayIndex = dimensionsForAllTiles.length;
    return nextArrayIndex;
}