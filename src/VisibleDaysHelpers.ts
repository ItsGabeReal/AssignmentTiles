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

// Returns the height of a day row (not including the separator between rows)
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

// Returns the y position of the top of the day row relative to the view it's stored in
export function getDayRowYOffset(visibleDays: DateYMD[], rowPlans: {[key: string]: RowPlan}, visibleDaysIndex: number) {
    const rowsAbove = visibleDaysIndex;
    const spaceBetweenRows = VisualSettings.App.dayRowSeparater.height;
    let sumOfDayRowHeights = 0;
    for (let i = 0; i < rowsAbove; i++) {
        sumOfDayRowHeights += getDayRowHeight(rowPlans, visibleDays[i]);
    }

    return (sumOfDayRowHeights + spaceBetweenRows * rowsAbove);
}

// Returns the screen y position of the top of a day row
export function getDayRowScreenYOffset(visibleDays: DateYMD[], rowPlans: {[key: string]: RowPlan}, scrollYOffset: number, visibleDaysIndex: number) {
    return getDayRowYOffset(visibleDays, rowPlans, visibleDaysIndex) - scrollYOffset;
}

// Returns the index of the day row at the specified screen position
export function getDayRowAtScreenPosition(visibleDays: DateYMD[], rowPlans: {[key: string]: RowPlan}, scrollYOffset: number, screenPosition: { x: number, y: number }) {
    const rowSeparatorHeight = VisualSettings.App.dayRowSeparater.height;
    let sumOfDayRowHeights = 0;
    for (let i = 0; i < visibleDays.length; i++) {
        sumOfDayRowHeights += getDayRowHeight(rowPlans, visibleDays[i]) + rowSeparatorHeight;

        if (screenPosition.y <= sumOfDayRowHeights-scrollYOffset) {
            return i;
        }
    }
    
    // Default return value in case a row couldn't be found
    return 0;
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
