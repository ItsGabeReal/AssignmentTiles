import React, { useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Modal,
} from "react-native";
import VisualSettings from "./json/VisualSettings.json";
import GlobalContext from "./context/GlobalContext";
import TestButton from "./components/TestButton";
import DayRow from "./components/DayRow";
import EventCreationScreen from "./components/EventCreationScreen";

const testEvents = [
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
]

export default function App() {
    const [eventData, setEventData] = useState(testEvents);

    const [rowData, setRowData] = useState(TEST_createInitialRowData(10));

    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    const [showEventCreationModal, setShowEventCreationModal] = useState(false);

    const scrollYOffset = useRef(0);

    const dayRowDimensions = useRef([]).current;

    const eventCreationScreenInitialDate = useRef(null);

    function TEST_createInitialRowData(numRows) {
        const output = [];
        const dates = createArrayOfDays(numRows);
        for (let i = 0; i < dates.length; i++) {
            output.push({
                date: dates[i],
                eventIDs: getEventIDsMatchingDate(dates[i]),
                id: Math.random(),
            });
        }
        return output;
    }

    function createArrayOfDays(numDays) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;
        let today = new Date();
        return Array.from({ length: numDays }, (e, i) => new Date(today.getTime() + ONE_DAY_IN_MILLISECONDS * i));
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

    function datesMatch(date1, date2) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;
        return Math.floor(date1.valueOf() / ONE_DAY_IN_MILLISECONDS) == Math.floor(date2.valueOf() / ONE_DAY_IN_MILLISECONDS);
    }

    function onTileDropped(gesture, event) {
        setIsScrollEnabled(true);
        const dropScreenPosition = { x: gesture.moveX, y: gesture.moveY };
        let overlappingRow = getRowOverlappingScreenPosition(dropScreenPosition);
        dropEventOntoRow(gesture, event, overlappingRow);
    }

    function getRowOverlappingScreenPosition(screenPosition) {
        for (let i = 0; i < rowData.length; i++) {
            let dayRowScreenYPosition = getDayRowScreenYPosition(rowData[i]);

            if (screenPosition.y > dayRowScreenYPosition && screenPosition.y < dayRowScreenYPosition + dayRowDimensions[i].height) {
                return rowData[i]; // <- 'i' should line up with the visibleDates index
            }
        }
        
        console.error('getRowOverlappingPagePosition: could not find a row overlapping screen position', dayRowScreenYPosition);
        return null;
    }
    
    function dropEventOntoRow(gesture, event, targetRow) {
        const copyOf_gesture = { ...gesture }; // Copy data from gesture so that it doesn't get reset before we can use it

        setRowData(prevData => {
            const outputRowData = [...prevData];
            
            const currentRow = outputRowData.find(row => datesMatch(row.date, event.date));
            const newRow = outputRowData.find(row => datesMatch(row.date, targetRow.date));
            
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

    function changeEventDate(event, newDate) {
        setEventData(prevData => {
            const output = [...prevData];
            output.find(item => (item.id == event.id)).date = newDate;
            return output;
        });
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

    function getDayRowScreenYPosition(row) {
        const rowIndex = rowData.findIndex(item => (item.id == row.id));

        let sumOfDayRowHeights = 0;
        for (let i = 0; i < rowIndex; i++) {
            sumOfDayRowHeights += dayRowDimensions[i].height;
        }
        return (sumOfDayRowHeights - scrollYOffset.current)
    }

    function onEventCreationScreenSubmitted(eventDetails) {
        createEvent(eventDetails);
        setShowEventCreationModal(false);
    }

    function createEvent(eventDetails) {
        const newEvent = {
            date: eventDetails.date ? eventDetails.date : new Date(),
            name: eventDetails.name ? eventDetails.name : "NO NAME",
            id: Math.random(),
        };
        
        // Insert it into event data
        setEventData(prevItems => [...prevItems, newEvent]);

        // Insert into the row with the same date
        const targetRowIndex = rowData.findIndex(item => datesMatch(item.date, newEvent.date));
        if (targetRowIndex != -1) {
            setRowData(prevItems => {
                const output = [...prevItems];
                output[targetRowIndex].eventIDs.push(newEvent.id);
                return output;
            });
        }
    }

    function openEventCreationScreen(initialDate) {
        if (initialDate) eventCreationScreenInitialDate.current = initialDate;
        else eventCreationScreenInitialDate.current = null;

        setShowEventCreationModal(true);
    }

    function onTileDragStart() {
        setIsScrollEnabled(false);
    }

    function onTestButtonPressed() {
        console.log(eventData);
    }

    return (
        <View style={styles.container}>
            <GlobalContext.Provider value={{ events: eventData, onTileDragStart: onTileDragStart, onTileDropped: onTileDropped }}>
                <FlatList
                    data={rowData}
                    renderItem={({ item, index }) => {
                        return (
                            <View
                                onLayout={(event) => {
                                    dayRowDimensions[index] = event.nativeEvent.layout;
                                }}
                            >
                                <DayRow date={item.date} eventIDs={item.eventIDs} onPress={openEventCreationScreen} />
                            </View>
                        );
                    }}
                    ItemSeparatorComponent={<View style={styles.dayRowSeparater} />}
                    scrollEnabled={isScrollEnabled}
                    onScroll={(event) => { scrollYOffset.current = event.nativeEvent.contentOffset.y; }}
                />
            </GlobalContext.Provider>
            <Modal
                animationType="slide"
                visible={showEventCreationModal}
                onRequestClose={() => setShowEventCreationModal(false)}
                presentationStyle="pageSheet"
            >
                <EventCreationScreen initialDate={eventCreationScreenInitialDate.current} onEventCreated={onEventCreationScreenSubmitted} />
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
    }
});