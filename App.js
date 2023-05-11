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
        let today = new Date();
        return Array.from({ length: numDays }, (e, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
    }

    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    const dayRowReferences = [];

    function onTestButtonPressed() {
        console.log(eventData);
    }

    function onTileDropped(dropLocation, event) {
        for (let i = 0; i < dayRowReferences.length; i++) {
            if (dayRowReferences[i] == null) console.log(`dayRowReferences[${i}] is null`);
            let rowIndex = i;
            checkIfDropOverlapsRow(dropLocation, rowIndex, event);
        }
    }

    function checkIfDropOverlapsRow(dropLocation, rowIndex, event) {
        const dropLocationCopy = { ...dropLocation }; // Because dropData resets after some time and measure() is asynchronous, we need to capture a copy of the data.
        dayRowReferences[rowIndex].measure((x, y, width, height, pageX, pageY) => {
            const dropY = dropLocationCopy.moveY;
            if (dropY >= pageY && dropY <= pageY + height) {
                const rowDate = visibleDates[rowIndex];
                changeEventDate(event, rowDate);
            }
        });
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
                    renderItem={
                        ({ item, index }) => {
                            return (
                                <View ref={(ref) => {
                                    /* Potential bug: It might be possible for dayRowReferences[index] to be set with a null value 
                                        because sometimes the item is rendered twice. */
                                    if (!dayRowReferences[index]) dayRowReferences[index] = ref;
                                }}>
                                    <DayRow date={item} />
                                </View>
                            );
                        }
                    }
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
