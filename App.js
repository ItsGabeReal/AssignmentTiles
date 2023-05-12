import React, { useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
} from "react-native";
import GlobalContext from "./context/GlobalContext";
import TestButton from "./components/TestButton";
import DayRow from './components/DayRow';

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

    const dayRowDimensions = useRef([]).current;

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
        const dropPosition = { x: gesture.moveX, y: gesture.moveY };
        let overlappingRow = getRowOverlappingPagePosition(dropPosition);
        dropEventOntoRow(gesture, event, overlappingRow);
    }

    function getRowOverlappingPagePosition(pagePosition) {
        let sumOfDayRowHeights = 0;
        for (let i = 0; i < dayRowDimensions.length; i++) {
            let dayRowPageY = sumOfDayRowHeights;
            if (pagePosition.y > dayRowPageY && pagePosition.y < dayRowPageY + dayRowDimensions[i].height) {
                return rowData[i]; // <- 'i' should line up with the visibleDates index
            }
            sumOfDayRowHeights += dayRowDimensions[i].height;
        }
        
        console.error('getRowOverlappingPagePosition: could not find a row overlapping page position', pagePosition);
        return null;
    }
    
    function dropEventOntoRow(gesture, event, targetRow) {
        setRowData(prevData => {
            const output = [...prevData];
            
            const currentRow = output.find(item => datesMatch(item.date, event.date));
            const newRow = output.find(item => datesMatch(item.date, targetRow.date));
            
            // Remove event from current row
            currentRow.eventIDs = currentRow.eventIDs.filter(item => (item != event.id));
            
            // Insert event into new row
            newRow.eventIDs.push(event.id);

            return output;
        });

        setEventData(prevData => {
            const output = [...prevData];
            output.find(item => (item.id == event.id)).date = targetRow.date;
            return output;
        });

    }

    function onTestButtonPressed() {
        //setIsScrollEnabled(prevValue => !prevValue);
        console.log(eventData);
    }

    return (
        <View style={styles.container}>
            <GlobalContext.Provider value={{ events: eventData, onTileDropped: onTileDropped }}>
                <FlatList
                    data={rowData}
                    renderItem={({ item, index }) => {
                        return (
                            <View
                                onLayout={(event) => {
                                    dayRowDimensions[index] = event.nativeEvent.layout;
                                }}
                            >
                                <DayRow date={item.date} eventIDs={item.eventIDs} />
                            </View>
                        );
                    }}
                    scrollEnabled={isScrollEnabled}
                />
            </GlobalContext.Provider>
            <TestButton onPress={onTestButtonPressed}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1
    },
    rowContainer: {
        flex: 1,
        minHeight: 90,
        borderColor: 'black',
        borderWidth: 1,
        flexDirection: 'row'
    },
    dateContainer: {
        flex: 1,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    entryContainer: {
        flex: 4,
        borderWidth: 1
    },
});
