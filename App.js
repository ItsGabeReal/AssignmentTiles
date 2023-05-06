import React, { useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Button,
} from "react-native";
import DayRow from './components/DayRow';

export default function App() {
    const ONE_DAY_IN_MILLISECONDS = 86400000;

    const [eventData, setEventData] = useState([
        {
            name: 'Football Practice',
            date: new Date(2023, 4, 5)
        },
        {
            name: 'Brain Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Open Heart Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Brain Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Open Heart Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Brain Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Open Heart Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Brain Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Open Heart Surgery',
            date: new Date(2023, 4, 6)
        },
        {
            name: 'Football Practice',
            date: new Date(2023, 4, 7)
        },
    ]);
    const [visibleDays, setVisibleDays] = useState(createArrayOfDays(10));

    function createArrayOfDays(numDays) {
        let today = new Date();
        return Array.from({length: numDays}, (e, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
    }

    function onTestButtonPressed() {
        console.log(eventData)
        console.log(visibleDays)
    }

    // Layout
    return (
        <View style={styles.container}>
            <FlatList
                data={visibleDays}
                keyExtractor={item => item.getTime()} // FlatLists are supposed to have a keyExtractor, but it seems to work fine without it
                renderItem={({ item }) => <DayRow date={item} eventData={eventData} />}
            />
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
