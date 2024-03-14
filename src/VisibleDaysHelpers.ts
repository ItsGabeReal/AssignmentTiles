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

// Finds the position a tile should be inserted based on the position of a drag gesture.
export function getInsertionIndexFromGesture(visibleDays: DateYMD[], visibleDaysIndex: number, rowPlans: {[key: string]: RowPlan}, scrollYOffset: number, gesture: Vector2D) {
    // Constants
    const tileWidth = VisualSettings.EventTile.mainContainer.width;
    const tileHeight = VisualSettings.EventTile.mainContainer.height;
    const tileYMargin = VisualSettings.EventTile.margin.bottom;
    const tileXMargin = VisualSettings.EventTile.margin.right;
    const flatlistPaddingtop = VisualSettings.DayRow.flatListContainer.paddingTop;
    const flatlistPaddingLeft = VisualSettings.DayRow.flatListContainer.paddingLeft;
    const dateTextContainerWidth = VisualSettings.DayRow.dateTextContainer.width;

    const rowPlanKey = DateYMDHelpers.toString(visibleDays[visibleDaysIndex]);
    const rowYOffset = getDayRowScreenYOffset(visibleDays, rowPlans, scrollYOffset, visibleDaysIndex);

    const numTiles = rowPlans[rowPlanKey]?.orderedEventIDs.length || 0;

    const numColumns = getNumEventColunms();
    const numRows = (numTiles === 0 ? 1 : Math.ceil(numTiles / numColumns));

    // Find insertion row
    let insertionRow = numRows-1;
    for (let i = 1; i < numRows; i++) {
        const rowEndY = rowYOffset + flatlistPaddingtop + i*(tileHeight + tileYMargin);

        if (gesture.y < rowEndY) {
            insertionRow = i-1;
            break;
        }
    }

    // Find insertion column
    let insertionColumn = numColumns-1;
    for (let i = 1; i < numColumns; i++) {
        const columnEndX = dateTextContainerWidth + flatlistPaddingLeft + i*(tileWidth + tileXMargin);
        
        if (gesture.x < columnEndX) {
            insertionColumn = i-1;
            break;
        }
    }

    return insertionRow*numColumns + insertionColumn;
}
