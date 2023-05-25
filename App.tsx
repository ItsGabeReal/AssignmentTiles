import React, { useRef, useState } from "react";
import {
    StyleSheet,
    View,
    Modal,
    FlatList,
    PanResponderGestureState,
    GestureResponderEvent,
    StatusBar,
} from "react-native";
import { Event, EventID } from "./types/EventTypes";
import { Row } from "./types/RowTypes";
import { datesMatch, today, getItemFromID } from "./src/helpers";
import VisualSettings from "./src/VisualSettings";
import CallbackContext from "./context/CallbackContext"
import InfiniteScrollFlatList from "./components/InfiniteScrollFlatList";
import TestButton from "./components/TestButton";
import DayRow from "./components/DayRow";
import EventCreator, { EventCreatorOutput } from "./components/EventCreator";

const testEvents: Event[] = [
    {
        name: 'Past Event',
        date: new Date(2023, 4, 10),
        id: Math.random(),
    },
    {
        name: 'Event 1',
        date: new Date(),
        id: Math.random(),
    },
    {
        name: 'Event 2',
        date: new Date(),
        id: Math.random(),
    },
    {
        name: 'Event 3',
        date: new Date(),
        id: Math.random(),
    },
    {
        name: 'Event 4',
        date: new Date(),
        id: Math.random(),
    },
    {
        name: 'Event 5',
        date: new Date(),
        id: Math.random(),
    },
    {
        name: 'Event 6',
        date: new Date(),
        id: Math.random(),
    },
    {
        name: 'Event 7',
        date: new Date(),
        id: Math.random(),
    },
];

type EventTileDimensions = {
    eventID: EventID;
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function App() {
    const [eventData, setEventData] = useState<Event[]>(testEvents);
    
    /**
     * rowData is a ref and should be accessed with .current. This fixes stale closure issues.
     * setRowData works like any other state setter.
     * 
     * One of the reasons rowData can't be a state is because it's supposed to
     * always have a set number of rows, meaning hooks that check if rowData has
     * changed won't notice any changes. Instead, use rowDataUpdateCount to
     * check if the state has changed.
     */
    const rowData = useRef<Row[]>(createInitialRowData());
    const [rowDataUpdateCount, setRowDataUpdateCount] = useState(0);

    function setRowData(callback: (prevData: Row[]) => Row[]) {
        rowData.current = callback(rowData.current);
        setRowDataUpdateCount(prevCount => prevCount + 1);
    }

    const [isScrollEnabled, setIsScrollEnabled] = useState(true);
    const [showEventCreator, setShowEventCreator] = useState(false);

    const scrollYOffset = useRef(0);
    const eventCreatorInitialDate = useRef<Date>();
    const flatListRef = useRef<FlatList<any> | null>(null);

    // ----- EVENT DATA -----
    function changeEventDate(event: Event, newDate: Date) {
        setEventData(prevData => {
            const output = [...prevData];
            getEventFromID(prevData, event.id).date = newDate;
            return output;
        });
    }

    function createEvent(eventDetails: EventCreatorOutput) {
        const newEvent: Event = {
            date: eventDetails.date,
            name: eventDetails.name,
            id: Math.random(),
        };
        
        // Insert it into event data
        setEventData(prevItems => [...prevItems, newEvent]);

        // Insert into the row with the same date
        const targetRowIndex = rowData.current.findIndex(item => datesMatch(item.date, newEvent.date));
        if (targetRowIndex != -1) {
            setRowData(prevItems => {
                const output = [...prevItems];
                output[targetRowIndex].eventIDs.push(newEvent.id);
                return output;
            });
    function getPlannedDateFromEventDetails(eventDetails: EventDetails) {
        if (eventDetails.dueDate) {
            return eventDetails.dueDate;
        }
        else if (eventDetails.beforeEventID) {
            const beforeEvent = getEventFromID(eventData, eventDetails.beforeEventID);
            if (!beforeEvent) {
                console.error(`could not find event with id = ${eventDetails.beforeEventID}`);
                return today();
            }
            return beforeEvent.layout.plannedDate;
        }
        else if (eventDetails.afterEventID) {
            const afterEvent = getEventFromID(eventData, eventDetails.afterEventID);
            if (!afterEvent) {
                console.error(`could not find event with id = ${eventDetails.beforeEventID}`);
                return today();
            }
            return afterEvent.layout.plannedDate;
        }
        else {
            return today();
        }
    }

    function deleteEvent(event: Event) {
        // Remove from day row
        const targetRowIndex = rowData.current.findIndex(item => datesMatch(item.date, event.date));
        setRowData(prevItems => {
            const output = [...prevItems];
            const targetRow = output[targetRowIndex];
            const eventIDIndex = targetRow.eventIDs.findIndex(id => id == event.id);
            targetRow.eventIDs.splice(eventIDIndex, 1);
            return output;
        });

        // Remove from event data
        setEventData(prevItems => {
            const output = [...prevItems];
            const eventIndex = output.findIndex(item => (item.id == event.id));
            output.splice(eventIndex, 1);
            return output;
        });
    }

    function getEventFromID(eventData: Event[], eventID: EventID) {
        return getItemFromID(eventData, eventID);
    }

    // ----- ROW DATA -----
    function createInitialRowData(): Row[] {
        const ONE_DAY_IN_MILLISECONDS = 86400000;
        const startDate = new Date(today().getTime() - ONE_DAY_IN_MILLISECONDS * 7);
        return createRowData(startDate, 21);
    }

    function createRowData(startDate: Date, numDays: number): Row[] {
        const ONE_DAY_IN_MILLISECONDS = 86400000;

        const newRowData: Row[] = [];
        for (let i = 0; i < numDays; i++) {
            const rowDate = new Date(startDate.getTime() + ONE_DAY_IN_MILLISECONDS * i);
            newRowData.push({
                date: rowDate,
                eventIDs: getEventIDsMatchingDate(rowDate),
                id: Math.random(),
            });
        }
        
        return (newRowData);
    }

    function addDayRowsToTop(numRows: number) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;

        const currentOldestDate = rowData.current[0].date;
        const startDate = new Date(currentOldestDate.getTime() - ONE_DAY_IN_MILLISECONDS * numRows);
        const newRowData = createRowData(startDate, numRows);

        const sumHeightOfNewRows = getRowYOffset(newRowData, numRows);
        flatListRef.current?.scrollToOffset({
            offset: sumHeightOfNewRows,
            animated: false,
        });

        setRowData(prevData => [...newRowData, ...prevData]);
    }

    function addDayRowsToBottom(numRows: number) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;

        const currentLastDate = rowData.current[rowData.current.length - 1].date;
        const startDate = new Date(currentLastDate.getTime() + ONE_DAY_IN_MILLISECONDS);
        const newRowData = createRowData(startDate, numRows);

        // Scroll offset correction if rows are removed from top
        /*const currentFlatListHeight = getRowYOffset(rowData.current, rowData.current.length);
        const sumHeightOfDeletedRows = getRowYOffset(rowData.current, numRows);
        const windowHeight = Dimensions.get('window').height;
        const bottomOfContentYOffset = currentFlatListHeight - sumHeightOfDeletedRows - windowHeight;*/

        setRowData(prevData => [...prevData, ...newRowData]);
    }

    function getEventIDsMatchingDate(date: Date) {
        let eventIDsMatchingDate = [];
        for (let i = 0; i < eventData.length; i++) {
            if (datesMatch(eventData[i].date, date)) {
                eventIDsMatchingDate.push(eventData[i].id);
            }
        }
        return eventIDsMatchingDate;
    }
    
    // ----- TILE DROP -----
    function onTileDropped(gesture: PanResponderGestureState, event: Event) {
        setIsScrollEnabled(true);

        const dropScreenPosition = { x: gesture.moveX, y: gesture.moveY };
        let overlappingRow = getRowOverlappingScreenPosition(dropScreenPosition);
        if (!overlappingRow) {
            console.error(`Could not find row overlapping screen y position ${dropScreenPosition}`);
            return;
        }

        dropEventOntoRow(gesture, event, overlappingRow);
    }

    function getRowOverlappingScreenPosition(screenPosition: {x: number, y: number}) {
        for (let i = 0; i < rowData.current.length; i++) {
            const dayRowScreenYPosition = getDayRowScreenYPosition(rowData.current[i]);

            if (screenPosition.y > dayRowScreenYPosition && screenPosition.y < dayRowScreenYPosition + getRowHeight(rowData.current[i])) {
                return rowData.current[i];
            }
        }
        
        console.error('getRowOverlappingPagePosition: could not find a row overlapping screen position', screenPosition);
        return null;
    }

    function getDayRowScreenYPosition(row: Row) {
        const rowIndex = rowData.current.findIndex(item => (item.id == row.id));
        const dayRowYOffset = getRowYOffset(rowData.current, rowIndex);
        
        return (dayRowYOffset - scrollYOffset.current);
    }
    
    function dropEventOntoRow(gesture: PanResponderGestureState, event: Event, targetRow: Row) {
        const copyOf_gesture: PanResponderGestureState = { ...gesture }; // Copy data from gesture so that it doesn't get reset before we can use it

        setRowData(prevData => {
            const outputRowData = [...prevData];
            
            const currentRow = outputRowData.find(row => datesMatch(row.date, event.date));
            if (!currentRow) {
                console.error(`Failed to find row with date matching ${event.date}`);
                return prevData;
            }

            const newRow = outputRowData.find(row => row.id == targetRow.id);
            if (!newRow) {
                console.error(`dropEventOntoRow -> setRowData: Failed to find row with id = ${targetRow.id}`);
                return prevData;
            }
            
            // Insert event into new row
            const eventInsertionIndex = getEventInsertionIndexBasedOnGesture(newRow, copyOf_gesture);
            newRow.eventIDs.splice(eventInsertionIndex, 0, event.id);
            
            // Remove event from current row
            if (currentRow.id == newRow.id) currentRow.eventIDs = currentRow.eventIDs.filter((item, index) => !(index != eventInsertionIndex && item == event.id));
            else currentRow.eventIDs = currentRow.eventIDs.filter((item) => !(item == event.id));
            
            changeEventDate(event, targetRow.date);
            
            return outputRowData;
        });

    }

    function getEventInsertionIndexBasedOnGesture(targetRow: Row, gesture: PanResponderGestureState) {
        const dimensionsForEventTilesInRow = getDimensionsForEventTilesInRow(targetRow);
        for (let i = 0; i < dimensionsForEventTilesInRow.length; i++) {
            const tileDimeions = dimensionsForEventTilesInRow[i];

            // Intermediate variables
            const tileXMidpoint = tileDimeions.x + tileDimeions.width / 2;
            const eventTileRightEdgePlusMargin = tileDimeions.x + tileDimeions.width + VisualSettings.EventTile.mainContainer.marginRight;

            // Overlap checks
            const gestureYOverlapsTile = gesture.moveY > tileDimeions.y && gesture.moveY < tileDimeions.y + tileDimeions.width;
            const gestureXOverlapsLeftHalf = gesture.moveX > tileDimeions.x && gesture.moveX < tileXMidpoint;
            const gestureXOverlapsRightHalf = gesture.moveX > tileXMidpoint && gesture.moveX < eventTileRightEdgePlusMargin;

            // If gesture overlaps with left side, insert to the left
            if (gestureXOverlapsLeftHalf && gestureYOverlapsTile) return i;

            // If gesture overlaps with right side, insert to the right
            if (gestureXOverlapsRightHalf && gestureYOverlapsTile) return(i + 1);
        }

        // Default return case
        return targetRow.eventIDs.length;
    }

    function getDimensionsForEventTilesInRow(row: Row) {
        const outputDimensions: EventTileDimensions[] = [];

        const dayRowScreenYPosition = getDayRowScreenYPosition(row);
        for (let i = 0; i < row.eventIDs.length; i++) {
            const tilesToTheLeft = i % VisualSettings.DayRow.numEventTileColumns;
            const tilesAbove = Math.floor(i / VisualSettings.DayRow.numEventTileColumns);
            
            const xPosition = (VisualSettings.DayRow.dateTextContainer.width + 
                VisualSettings.DayRow.dateTextContainer.borderRightWidth +
                VisualSettings.DayRow.flatListContainer.paddingLeft +
                tilesToTheLeft * (VisualSettings.EventTile.mainContainer.width + VisualSettings.EventTile.mainContainer.marginRight));
            
            const yPosition = (dayRowScreenYPosition +
                VisualSettings.DayRow.flatListContainer.paddingTop + 
                tilesAbove * (VisualSettings.EventTile.mainContainer.height + VisualSettings.App.dayRowSeparater.height));
            
            outputDimensions[i] = {
                eventID: row.eventIDs[i],
                x: xPosition,
                y: yPosition,
                width: VisualSettings.EventTile.mainContainer.width,
                height: VisualSettings.EventTile.mainContainer.height,
            }
        }

        return outputDimensions;
    }

    // ----- COMPONENT PARAMETERS -----
    function onTileDragStart() {
        setIsScrollEnabled(false);
    }

    function openEventCreator(gesture: GestureResponderEvent, row: Row) {
        eventCreatorInitialDate.current = row.date;

        setShowEventCreator(true);
    }

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(referenceToRowData: Row[] | null | undefined, index: number) {
        const dayRowHeight = getRowHeight(rowData.current[index]);

        return ({
            length: dayRowHeight,
            offset: getRowYOffset(rowData.current, index),
            index
        });
    }

    function getRowHeight(row: Row) {
        const eventTileHeight = VisualSettings.EventTile.mainContainer.height;
        let eventContainerHeight;
        const hasAnyEventTiles = row.eventIDs.length > 0;
        if (hasAnyEventTiles) {
            const spaceBetweenEventTiles = VisualSettings.EventTile.mainContainer.marginBottom;
            const rowsOfEventTiles = Math.ceil(row.eventIDs.length / VisualSettings.DayRow.numEventTileColumns);
            eventContainerHeight = eventTileHeight * rowsOfEventTiles + spaceBetweenEventTiles * (rowsOfEventTiles - 1);
        }
        else {
            eventContainerHeight = eventTileHeight;
        }

        const topAndBottomMargin = VisualSettings.DayRow.flatListContainer.paddingTop + VisualSettings.EventTile.mainContainer.marginBottom;

        return (eventContainerHeight + topAndBottomMargin);
    }

    function getRowYOffset(rowData: Row[], rowIndex: number) {
        const rowsAbove = rowIndex;
        const spaceBetweenRows = VisualSettings.App.dayRowSeparater.height;
        let sumOfDayRowHeights = 0;
        for (let i = 0; i < rowsAbove; i++) {
            sumOfDayRowHeights += getRowHeight(rowData[i]);
        }

        return (sumOfDayRowHeights + spaceBetweenRows * rowsAbove);
    }

    function getDayRowIndexFromDate(date: Date) {
        return rowData.current.findIndex(row => datesMatch(row.date, date));
    }

    function onStartReached() {
        console.log('start reached');
        addDayRowsToTop(7);
    }

    function onEndReached() {
        console.log('end reached');
        addDayRowsToBottom(7);
    }

    function onEventCreatorSubmitted(eventDetails: EventCreatorOutput) {
        createEvent(eventDetails);
        setShowEventCreator(false);
    }

    function onTestButtonPressed() {
        
    }

    function renderDayRow({ item }: {item: Row}) {
        return <DayRow row={item} eventData={eventData} onPress={openEventCreator} />;
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#fff'} barStyle={"dark-content"} />
            <CallbackContext.Provider value={{ onTileDragStart: onTileDragStart, onTileDropped: onTileDropped }}>
                <InfiniteScrollFlatList
                    ref={flatListRef}
                    data={rowData.current}
                    renderItem={renderDayRow}
                    ItemSeparatorComponent={DayRowSeparater}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={getDayRowIndexFromDate(today())}
                    scrollEnabled={isScrollEnabled}
                    onScroll={(event) => { scrollYOffset.current = event.nativeEvent.contentOffset.y; }}
                    onStartReached={onStartReached}
                    onEndReached={onEndReached}
                    showsVerticalScrollIndicator={false}
                />
            </CallbackContext.Provider>
            <Modal
                animationType="slide"
                visible={showEventCreator}
                onRequestClose={() => setShowEventCreator(false)}
                presentationStyle="pageSheet"
            >
                <EventCreator initialDate={eventCreatorInitialDate.current} onEventCreated={onEventCreatorSubmitted} />
            </Modal>
            <TestButton onPress={onTestButtonPressed}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1
    },
    dayRowSeparater: {
        backgroundColor: '#000',
        height: VisualSettings.App.dayRowSeparater.height,
        zIndex: 1,
    }
});