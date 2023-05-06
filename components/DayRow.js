import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
} from "react-native";
import EventTile from './EventTile';

const DAY_NAMES_ABREV = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ONE_DAY_IN_MILLISECONDS = 86400000;

function datesMatch(date1, date2) {
    return Math.floor(date1.valueOf() / ONE_DAY_IN_MILLISECONDS) == Math.floor(date2.valueOf() / ONE_DAY_IN_MILLISECONDS);
}

function getEventIndexesForDate(eventData, date) {
    let eventIndexes = []
    for (let i = 0; i < eventData.length; i++) {
        if (datesMatch(eventData[i].date, date)) {
            eventIndexes.push(i);
        }
    }
    return eventIndexes;
}

export default function DayRow({ date, eventData }) {
    // Create a list of events that occur on this day
    const [eventIndexes, setEventIndexes] = useState(getEventIndexesForDate(eventData, date));

    return (
        <View style={styles.dayRow}>
            <View style={styles.dateTextContainer}>
                <Text>{DAY_NAMES_ABREV[date.getDay()]}, {date.getMonth()}/{date.getDate()}</Text>
            </View>
            <View style={styles.eventTileContainer}>
                <FlatList
                    data={eventIndexes}
                    keyExtractor={item => item} // FlatLists are supposed to have a keyExtractor, but it seems to work fine without it
                    numColumns={3}
                    renderItem={({ item }) => <EventTile eventIndex={item} eventData={eventData} />}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    dayRow: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 80,
        borderColor: 'black',
        borderBottomWidth: 1,
    },
    dateTextContainer: {
        flex: 1,
        borderRightWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    eventTileContainer: {
        flex: 4,
        padding: 5,
    },
});
