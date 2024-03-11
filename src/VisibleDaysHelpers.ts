import DateYMD, { DateYMDHelpers } from "./DateYMD";
import { RowPlan } from "../types/store-current";
import VisualSettings, {getNumEventColunms} from "./VisualSettings";
import { Vector2D } from "../types/General";

export type EventTileDimensions = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function getDayRowHeight(rowPlans: {[key: string]: RowPlan}, date: DateYMD) {
    const eventTileHeight = VisualSettings.EventTile.mainContainer.height;
    let eventContainerHeight;

    const key = DateYMDHelpers.toString(date);
    
    if (!(key in rowPlans) || rowPlans[key].orderedEventIDs.length == 0) {
        eventContainerHeight = eventTileHeight;
    }
    else {
        const verticalSpaceBetweenTiles = VisualSettings.EventTile.margin.bottom;
        const numTileRows = Math.ceil(rowPlans[key].orderedEventIDs.length / getNumEventColunms());
        eventContainerHeight = eventTileHeight * numTileRows + verticalSpaceBetweenTiles * (numTileRows - 1);
    }

    const topAndBottomMargin = VisualSettings.DayRow.flatListContainer.paddingTop + VisualSettings.EventTile.margin.bottom;

    return (eventContainerHeight + topAndBottomMargin);
}

export function getDayRowYOffset(visibleDays: DateYMD[], rowPlans: {[key: string]: RowPlan}, visibleDaysIndex: number) {
    const rowsAbove = visibleDaysIndex;
    const spaceBetweenRows = VisualSettings.App.dayRowSeparater.height;
    let sumOfDayRowHeights = 0;
    for (let i = 0; i < rowsAbove; i++) {
        sumOfDayRowHeights += getDayRowHeight(rowPlans, visibleDays[i]);
    }

    return (sumOfDayRowHeights + spaceBetweenRows * rowsAbove);
}

export function getDayRowScreenYOffset(visibleDays: DateYMD[], rowPlans: {[key: string]: RowPlan}, scrollYOffset: number, visibleDaysIndex: number) {
    return getDayRowYOffset(visibleDays, rowPlans, visibleDaysIndex) - scrollYOffset;
}

// Uses a binary search method to find the day row at the given screen position
export function getDayRowAtScreenPosition(visibleDays: DateYMD[], rowPlans: {[key: string]: RowPlan}, scrollYOffset: number, screenPosition: { x: number, y: number }) {
    return _getDayRowAtScreenPosition(visibleDays, rowPlans, scrollYOffset, screenPosition, 0, visibleDays.length-1);
}

// Recursive implementation of getDayRowAtScreenPosition
function _getDayRowAtScreenPosition(visibleDays: DateYMD[], rowPlans: {[key: string]: RowPlan}, scrollYOffset: number, screenPosition: { x: number, y: number }, start: number, end: number) {
    const midIndex = start + Math.floor((end - start) / 2);

    // Check for overlap
    const rowScreenYOffset = getDayRowScreenYOffset(visibleDays, rowPlans, scrollYOffset, midIndex);
    const rowHeight = getDayRowHeight(rowPlans, visibleDays[midIndex]);
    if (screenPosition.y > rowScreenYOffset && screenPosition.y < rowScreenYOffset + rowHeight + VisualSettings.DayRow.flatListContainer.paddingTop)
        return visibleDays[midIndex];

    // Check if we're out of elements to search
    if (start === end)
        return null;

    // Check for overshoot
    if (screenPosition.y < rowScreenYOffset)
        return _getDayRowAtScreenPosition(visibleDays, rowPlans, scrollYOffset, screenPosition, start, midIndex-1);

    // If we make it here, we've undershot
    return _getDayRowAtScreenPosition(visibleDays, rowPlans, scrollYOffset, screenPosition, midIndex+1, end);
}

export function getEventTilePosition(rowYOffset: number, eventRowOrder: number) {
    const numColumns = getNumEventColunms();
    const tilesToTheLeft = eventRowOrder % numColumns;
    const tilesAbove = Math.floor(eventRowOrder / numColumns);

    const xPosition = (VisualSettings.DayRow.dateTextContainer.width
        + VisualSettings.DayRow.flatListContainer.paddingLeft
        + tilesToTheLeft * (VisualSettings.EventTile.mainContainer.width + VisualSettings.EventTile.margin.right));

    const yPosition = (rowYOffset
        + VisualSettings.DayRow.flatListContainer.paddingTop
        + tilesAbove * (VisualSettings.EventTile.mainContainer.height + VisualSettings.EventTile.margin.bottom));

    const outputDimensions: Vector2D = {
        x: xPosition,
        y: yPosition
    }

    return outputDimensions;
}

export function getInsertionIndexFromGesture(visibleDays: DateYMD[], visibleDaysIndex: number, rowPlans: {[key: string]: RowPlan}, scrollYOffset: number, gesture: Vector2D) {
    //const dimensionsForAllTiles = getDimensionsForAllTilesInRow(visibleDays, rowPlans, scrollYOffset, visibleDaysIndex);
    // Constants
    const numColumns = getNumEventColunms();
    const tileWidth = VisualSettings.EventTile.mainContainer.width;
    const tileYMargin = VisualSettings.EventTile.margin.bottom;
    const tileXMargin = VisualSettings.EventTile.margin.right;
    const dayRowYMargin = VisualSettings.App.dayRowSeparater.height;

    const rowPlanKey = DateYMDHelpers.toString(visibleDays[visibleDaysIndex]);
    const rowYOffset = getDayRowScreenYOffset(visibleDays, rowPlans, scrollYOffset, visibleDaysIndex);

    const numTiles = rowPlans[rowPlanKey]?.orderedEventIDs.length || 0;
    for (let i = 0; i < numTiles; i++) {
        const tilePosition = getEventTilePosition(rowYOffset, i);

        // Intermediate variables
        const inFirstRow = Math.floor(i / numColumns) === 0;
        
        // Overlap checks
        const yStart = tilePosition.y - tileYMargin - (inFirstRow ? dayRowYMargin : 0);
        const yEnd = tilePosition.y + tileWidth + tileYMargin;
        const gestureYOverlapsTile = gesture.y > yStart && gesture.y < yEnd;

        const xStart = tilePosition.x;
        const xEnd = tilePosition.x + tileWidth + tileXMargin;
        const gestureXOverlapsTile = gesture.x > xStart && gesture.x < xEnd;
        
        // Return insert index
        if (gestureYOverlapsTile) {
            if (gestureXOverlapsTile) {
                return i;
            }
            
            const firstInRow = (i % numColumns) === 0;
            if (firstInRow && (gesture.x < tilePosition.x)) { // Handle edge case where gesture is in the left margin of the screen
                return i;
            }
        }
    }

    // If no index can be found, return an insertion index at the end of the row
    return numTiles;
}
