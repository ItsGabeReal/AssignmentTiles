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
    const [eventData, setEventData] = useState(testEvents); // <- Update this to load events from file

    const [visibleDates, setVisibleDates] = useState(createArrayOfDays(10));

    function createArrayOfDays(numDays) {
        const ONE_DAY_IN_MILLISECONDS = 86400000;
        let today = new Date();
        return Array.from({ length: numDays }, (e, i) => new Date(today.getTime() + ONE_DAY_IN_MILLISECONDS * i));
    }

    const dayRowDimensions = useRef([]).current;

    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    function onTestButtonPressed() {
        //setIsScrollEnabled(prevValue => !prevValue);
        console.log(dayRowDimensions);
    }

    function onTileDropped(gesture, event) {
        // Step 1: Find the row it was dropped into
        // Step 2: Check if it dropped on top of a tile and wether it should go before or after it
        // Step 3: Change event date, triggering a rerender
        const dropPosition = { x: gesture.moveX, y: gesture.moveY };
        let overlappingRowIndex = getRowOverlappingPagePosition(dropPosition);
        changeEventDate(event, visibleDates[overlappingRowIndex]);
    }

    function getRowOverlappingPagePosition(pagePosition) {
        let sumOfDayRowHeights = 0;
        for (let i = 0; i < dayRowDimensions.length; i++) {
            let dayRowPageY = sumOfDayRowHeights;
            if (pagePosition.y > dayRowPageY && pagePosition.y < dayRowPageY + dayRowDimensions[i].height) {
                return i; // <- 'i' should line up with the visibleDates index
            }
            sumOfDayRowHeights += dayRowDimensions[i].height;
        }
        
        console.error('getRowOverlappingPagePosition: could not find a row overlapping page position', pagePosition);
        return null;
    }

    function changeEventDate(event, newDate) {
        setEventData(prevData => {
            let output = [...prevData];
            output.find(item => {
                return item.id == event.id;
            }).date = newDate;
            return output;
        });
    }

    return (
        <View style={styles.container}>
            <GlobalContext.Provider value={{ events: eventData, onTileDropped: onTileDropped }}>
                <FlatList
                    data={visibleDates}
                    renderItem={({ item, index }) => {
                        return (
                            <View
                                onLayout={(event) => {
                                    dayRowDimensions[index] = event.nativeEvent.layout;
                                }}
                            >
                                <DayRow date={item} />
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
