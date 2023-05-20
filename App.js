import React, { useRef, useState } from "react";
import {
    StyleSheet,
    View,
    Modal,
    Dimensions,
} from "react-native";
import { datesMatch, today, getItemFromID } from "./src/helpers";
import VisualSettings from "./src/VisualSettings";
import EventContext from "./context/EventContext";
import InfiniteScrollFlatList from "./components/InfiniteScrollFlatList";
import TestButton from "./components/TestButton";
import DayRow from "./components/DayRow";
import EventCreationScreen from "./components/EventCreationScreen";

const testEvents = [
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

export default function App() {
    const [eventData, setEventData] = useState(testEvents);
    
    /**
     * rowData is a ref and should be accessed with .current. This fixes stale closure issues.
     * setRowData works like any other state setter.
     * 
     * One of the reasons rowData can't be a state is because it's supposed to
     * always have a set number of rows, meaning hooks that check if rowData has
     * changed won't notice any changes. Instead, use rowDataUpdateCount to
     * check if the state has changed.
     */
    const rowData = useRef(createInitialRowData());
    const [rowDataUpdateCount, setRowDataUpdateCount] = useState(0);
    function setRowData(callback) {
        rowData.current = callback(rowData.current);
        setRowDataUpdateCount(prevCount => prevCount + 1);
    }

    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    const [showEventCreationModal, setShowEventCreationModal] = useState(false);

    const scrollYOffset = useRef(0);

    const eventCreationScreenInitialDate = useRef(null);

    const flatListRef = useRef(null);

    // ----- EVENT DATA -----
    function changeEventDate(event, newDate) {
        setEventData(prevData => {
            const output = [...prevData];
            getEventFromID(prevData, event.id).date = newDate;
            return output;
        });
    }

    function createEvent(eventDetails) {
        const newEvent = {
            date: eventDetails.date ? eventDetails.date : today(),
            name: eventDetails.name ? eventDetails.name : "NO NAME",
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
        }
    }

    function deleteEvent(event) {
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

    function getEventFromID(eventData, eventID) {
        return getItemFromID(eventData, eventID);
    }

    // ----- ROW DATA -----
    function createInitialRowData() {
        const ONE_DAY_IN_MILLISECONDS = 86400000;
        const startDate = new Date(today().getTime() - ONE_DAY_IN_MILLISECONDS * 7);
        return createRowData(startDate, 21);
    }

    function createRowData(startDate, numDays) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;

        const newRowData = [];
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

    function addDayRowsToTopAndRemoveFromBottom(numRows) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;

        const currentOldestDate = rowData.current[0].date;
        const startDate = new Date(currentOldestDate.getTime() - ONE_DAY_IN_MILLISECONDS * numRows);
        const newRowData = createRowData(startDate, numRows);

        // Keep view in place by preventing
        const sumHeightOfNewRows = getDayRowYOffset(newRowData, newRowData.length);
        
        setTimeout(() => {
            flatListRef.current.scrollToOffset({
                offset: sumHeightOfNewRows,
                animated: false,
            });
        }, 1000);

        setRowData(prevData => {
            const output = [...newRowData, ...prevData];
            output.length = output.length - numRows;
            return output;
        });
    }

    function addDayRowsToBottomAndRemoveFromTop(numRows) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;

        const currentLastDate = rowData.current[rowData.current.length - 1].date;
        const startDate = new Date(currentLastDate.getTime() + ONE_DAY_IN_MILLISECONDS);
        const newRowData = createRowData(startDate, numRows);

        const currentFlatListHeight = getDayRowYOffset(rowData.current, rowData.current.length);
        const sumHeightOfDeletedRows = getDayRowYOffset(rowData.current, numRows);
        const windowHeight = Dimensions.get('window').height;
        const bottomOfContentYOffset = currentFlatListHeight - sumHeightOfDeletedRows - windowHeight;

        flatListRef.current.scrollToOffset({
            offset: bottomOfContentYOffset,
            animated: false,
        });

        setRowData(prevData => {
            let output = [...prevData, ...newRowData];
            output.splice(0, numRows);
            return output;
        });
    }

    function getEventIDsMatchingDate(date) {
        let eventIDsMatchingDate = [];
        for (let i = 0; i < eventData.length; i++) {
            if (datesMatch(eventData[i].date, date)) {
                eventIDsMatchingDate.push(eventData[i].id);
            }
        }
        return eventIDsMatchingDate;
    }
    
    // ----- TILE DROP -----
    function onTileDropped(gesture, event) {
        setIsScrollEnabled(true);
        const dropScreenPosition = { x: gesture.moveX, y: gesture.moveY };
        let overlappingRow = getRowOverlappingScreenPosition(dropScreenPosition);
        dropEventOntoRow(gesture, event, overlappingRow);
    }

    function getRowOverlappingScreenPosition(screenPosition) {
        for (let i = 0; i < rowData.current.length; i++) {
            const dayRowScreenYPosition = getDayRowScreenYPosition(rowData.current[i]);

            if (screenPosition.y > dayRowScreenYPosition && screenPosition.y < dayRowScreenYPosition + getDayRowHeight(rowData.current[i])) {
                return rowData.current[i];
            }
        }
        
        console.error('getRowOverlappingPagePosition: could not find a row overlapping screen position', dayRowScreenYPosition);
        return null;
    }

    function getDayRowScreenYPosition(row) {
        const rowIndex = rowData.current.findIndex(item => (item.id == row.id));
        const dayRowYOffset = getDayRowYOffset(rowData.current, rowIndex);
        
        return (dayRowYOffset - scrollYOffset.current)
    }
    
    function dropEventOntoRow(gesture, event, targetRow) {
        const copyOf_gesture = { ...gesture }; // Copy data from gesture so that it doesn't get reset before we can use it

        setRowData(prevData => {
            const outputRowData = [...prevData];
            
            const currentRow = outputRowData.find(row => datesMatch(row.date, event.date));
            const newRow = outputRowData.find(row => row.id == targetRow.id);
            
            // Insert event into new row
            const eventInsertionIndex = getDayRowEventInsertionIndexBasedOnGesture(newRow, copyOf_gesture);
            newRow.eventIDs.splice(eventInsertionIndex, 0, event.id);
            
            // Remove event from current row
            if (currentRow.id == newRow.id) currentRow.eventIDs = currentRow.eventIDs.filter((item, index) => !(index != eventInsertionIndex && item == event.id));
            else currentRow.eventIDs = currentRow.eventIDs.filter((item) => !(item == event.id));
            
            changeEventDate(event, targetRow.date);
            
            return outputRowData;
        });

    }

    function getDayRowEventInsertionIndexBasedOnGesture(dayRow, gesture) {
        const dimensionsForEventTilesInRow = getDimensionsForEventTilesInRow(dayRow);
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
        return dayRow.eventIDs.length;
    }

    function getDimensionsForEventTilesInRow(row) {
        const outputDimensions = [];

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

    function tileDeletionTest(eventToBeDeleted) {
        deleteEvent(eventToBeDeleted);
    }

    function openEventCreationModal(initialDate) {
        if (initialDate) eventCreationScreenInitialDate.current = initialDate;
        else eventCreationScreenInitialDate.current = null;

        setShowEventCreationModal(true);
    }

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(referenceToRowData, index) {
        const dayRowHeight = getDayRowHeight(referenceToRowData[index]);

        return ({
            length: dayRowHeight,
            offset: getDayRowYOffset(referenceToRowData, index),
            index
        });
    }

    function getDayRowHeight(row) {
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

    function getDayRowYOffset(rowData, rowIndex) {
        const rowsAbove = rowIndex;
        const spaceBetweenRows = VisualSettings.App.dayRowSeparater.height;
        let sumOfDayRowHeights = 0;
        for (let i = 0; i < rowsAbove; i++) {
            sumOfDayRowHeights += getDayRowHeight(rowData[i]);
        }

        return (sumOfDayRowHeights + spaceBetweenRows * rowsAbove);
    }

    function getDayRowIndexFromDate(date) {
        return rowData.current.findIndex(row => datesMatch(row.date, date));
    }

    function onStartReached() {
        addDayRowsToTopAndRemoveFromBottom(7);
    }

    function onEndReached() {
        addDayRowsToBottomAndRemoveFromTop(7);
    }

    function onEventCreationModalSubmitted(eventDetails) {
        createEvent(eventDetails);
        setShowEventCreationModal(false);
    }

    function onTestButtonPressed() {
        for (let i = 0; i < rowData.current.length; i++) {
            console.log(`rowData.current[${i}]: ${rowData.current[i].date.getMonth() + 1}/${rowData.current[i].date.getDate()} | ${rowData.current[i].id}`)
        }
    }

    return (
        <View style={styles.container}>
            <EventContext.Provider value={{ events: eventData, onTileDragStart: onTileDragStart, onTileDropped: onTileDropped, tileDeletionTest: tileDeletionTest }}>
                <InfiniteScrollFlatList
                    ref={flatListRef}
                    data={rowData.current}
                    renderItem={({ item }) => <DayRow date={item.date} eventIDs={item.eventIDs} onPress={openEventCreationModal} />}
                    ItemSeparatorComponent={DayRowSeparater}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={getDayRowIndexFromDate(today())}
                    scrollEnabled={isScrollEnabled}
                    onScroll={(event) => { scrollYOffset.current = event.nativeEvent.contentOffset.y; }}
                    onStartReached={onStartReached}
                    onEndReached={onEndReached}
                    onStartReachedThreshold={10}
                    onEndReachedThreshold={10}
                    //showsVerticalScrollIndicator={false}
                />
            </EventContext.Provider>
            <Modal
                animationType="slide"
                visible={showEventCreationModal}
                onRequestClose={() => setShowEventCreationModal(false)}
                presentationStyle="pageSheet"
            >
                <EventCreationScreen initialDate={eventCreationScreenInitialDate.current} onEventCreated={onEventCreationModalSubmitted} />
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