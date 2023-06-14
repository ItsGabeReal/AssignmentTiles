import { GestureResponderEvent } from "react-native";
import DateYMD from "./DateYMD";
import { EventTileDimensions, EventsOnDate } from "../types/EventTypes";
import VisualSettings from "./VisualSettings";
import { getEventsOnDate } from "./RowEventsHelpers";

export type VisibleDaysReducerAction =
    | { type: 'add-to-bottom', numNewDays: number, removeFromTop?: boolean }
    | { type: 'add-to-top', numNewDays: number, removeFromBottom?: boolean };

export function visibleDaysReducer(state: DateYMD[], action: VisibleDaysReducerAction) {
    if (action.type == 'add-to-bottom') { // TESTING REQUIRED
        const { numNewDays, removeFromTop = false } = action;

        const currentLastDate = state[state.length - 1];
        const startDate = currentLastDate.addDays(1);
        const newDates = createArrayOfSequentialDates(startDate, numNewDays);

        const outputDates = [...state, ...newDates];

        if (removeFromTop) {
            outputDates.splice(0, numNewDays);
        }

        return outputDates;
    }
    else if (action.type == 'add-to-top') { // TESTING REQUIRED
        const { numNewDays, removeFromBottom = false } = action;

        const currentFirstDate = state[0];
        const startDate = currentFirstDate.subtractDays(numNewDays);
        const newDates = createArrayOfSequentialDates(startDate, numNewDays);

        const outputDates = [...newDates, ...state];

        if (removeFromBottom) {
            outputDates.length = outputDates.length - numNewDays;
        }

        return outputDates;
    }
    else return state;
}

const createArrayOfSequentialDates = (startDate: DateYMD, numDays: number) => {
    const outputDates: DateYMD[] = [];

    for (let i = 0; i < numDays; i++) {
        outputDates.push(startDate.addDays(i));
    }

    return outputDates;
}

export function initializeVisibleDays() {
    const numDaysAboveToday = 7 * 2;
    const numDaysBelowToday = 7 * 3 - 1;

    const totalDays = numDaysAboveToday + 1 + numDaysBelowToday;
    const startDate = DateYMD.today().subtractDays(numDaysAboveToday);

    return createArrayOfSequentialDates(startDate, totalDays);
}

export function getDayRowHeight(rowEvents: EventsOnDate[], date: DateYMD) {
    const eventTileHeight = VisualSettings.EventTile.mainContainer.height;
    
    const eventsOnDate = getEventsOnDate(rowEvents, date);
    

    let eventContainerHeight;
    if (!eventsOnDate || eventsOnDate.orderedEventIDs.length == 0) {
        eventContainerHeight = eventTileHeight;
    }
    else {
        const verticalSpaceBetweenTiles = VisualSettings.EventTile.mainContainer.marginBottom;
        const numTileRows = Math.ceil(eventsOnDate.orderedEventIDs.length / VisualSettings.DayRow.numEventTileColumns);
        eventContainerHeight = eventTileHeight * numTileRows + verticalSpaceBetweenTiles * (numTileRows - 1);
    }

    const topAndBottomMargin = VisualSettings.DayRow.flatListContainer.paddingTop + VisualSettings.EventTile.mainContainer.marginBottom;

    return (eventContainerHeight + topAndBottomMargin);
}

export function getDayRowYOffset(visibleDays: DateYMD[], rowEvents: EventsOnDate[], visibleDaysIndex: number) {
    const rowsAbove = visibleDaysIndex;
    const spaceBetweenRows = VisualSettings.App.dayRowSeparater.height;
    let sumOfDayRowHeights = 0;
    for (let i = 0; i < rowsAbove; i++) {
        sumOfDayRowHeights += getDayRowHeight(rowEvents, visibleDays[i]);
    }

    return (sumOfDayRowHeights + spaceBetweenRows * rowsAbove);
}

export function getDayRowScreenYOffset(visibleDays: DateYMD[], rowEvents: EventsOnDate[], scrollYOffset: number, visibleDaysIndex: number) {
    return getDayRowYOffset(visibleDays, rowEvents, visibleDaysIndex) - scrollYOffset;
}

export function getDayRowAtScreenPosition(visibleDays: DateYMD[], rowEvents: EventsOnDate[], scrollYOffset: number, screenPosition: { x: number, y: number }) {
    for (let i = 0; i < visibleDays.length; i++) {
        const rowScreenYOffset = getDayRowScreenYOffset(visibleDays, rowEvents, scrollYOffset, i);
        const rowHeight = getDayRowHeight(rowEvents, visibleDays[i]);
        if (screenPosition.y > rowScreenYOffset && screenPosition.y < rowScreenYOffset + rowHeight) {
            return visibleDays[i];
        }
    }

    return null;
}

function getDimensionsForAllTilesInRow(visibleDays: DateYMD[], rowEvents: EventsOnDate[], scrollYOffset: number, visibleDaysIndex: number) {
    const rowYOffset = getDayRowScreenYOffset(visibleDays, rowEvents, scrollYOffset, visibleDaysIndex);

    const eventsOnDate = getEventsOnDate(rowEvents, visibleDays[visibleDaysIndex]);
    if (!eventsOnDate) return [];
    
    const outputDimensions: EventTileDimensions[] = [];
    for (let i = 0; i < eventsOnDate.orderedEventIDs.length; i++) {
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

export function getInsertionIndexFromGesture(visibleDays: DateYMD[], rowEvents: EventsOnDate[], scrollYOffset: number, visibleDaysIndex: number, gesture: GestureResponderEvent) {
    const dimensionsForAllTiles = getDimensionsForAllTilesInRow(visibleDays, rowEvents, scrollYOffset, visibleDaysIndex);
    
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