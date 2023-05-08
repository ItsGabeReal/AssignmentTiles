import React, { useContext, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Button,
} from "react-native";
import EventContext from "./context/EventContext";
import DayRowContext from "./context/DayRowContext";
import DayRow from './components/DayRow';

const testEvents = [
    {
        name: 'Event 1',
        date: new Date()
    },
    {
        name: 'Event 2',
        date: new Date()
    },
    {
        name: 'Event 3',
        date: new Date()
    },
    {
        name: 'Event 4',
        date: new Date()
    },
    {
        name: 'Event 5',
        date: new Date()
    },
    {
        name: 'Event 6',
        date: new Date()
    },
    {
        name: 'Event 7',
        date: new Date(2023, 4, 8)
    },
]

export default function App() {
    const [visibleDays, setVisibleDays] = useState(createArrayOfDays(10));

    function createArrayOfDays(numDays) {
        let today = new Date();
        return Array.from({ length: numDays }, (e, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
    }

    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    function onTestButtonPressed() {
        console.log(dayComponentContainer);
    }

    const dayComponentContainer = useRef(null);

    return (
        <View style={styles.container}>
            <EventContext.Provider value={{ events: testEvents }}>
                <FlatList
                    ref={dayComponentContainer}
                    data={visibleDays}
                    keyExtractor={item => item.getTime()} // FlatLists are supposed to have a keyExtractor, but it seems to work fine without it
                    renderItem={({ item }) => <DayRow date={item} />}
                    scrollEnabled={isScrollEnabled}
                />
            </EventContext.Provider>
            
            <View style={styles.testButtonContainer}>
                <Button
                    onPress={onTestButtonPressed}
                    title="Test"
                />

            </View>
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
    testButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    testButton: {
        backgroundColor: '#d0d0d0',
        padding: 10,
        borderRadius: 5,
        width: 70,
        alignItems: 'center'
    }
});
