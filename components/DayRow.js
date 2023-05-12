import { useContext, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
} from "react-native";
import EventTile from './EventTile';
import GlobalContext from '../context/GlobalContext';

const DAY_NAMES_ABREV = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const ONE_DAY_IN_MILLISECONDS = 86400000;

function datesMatch(date1, date2) {
    return Math.floor(date1.valueOf() / ONE_DAY_IN_MILLISECONDS) == Math.floor(date2.valueOf() / ONE_DAY_IN_MILLISECONDS);
}

function getEventsMatchingDate(eventData, date) {
    let eventsMatchingDate = [];
    for (let i = 0; i < eventData.length; i++) {
        if (datesMatch(eventData[i].date, date)) {
            eventsMatchingDate.push(eventData[i]);
        }
    }
    return eventsMatchingDate;
}

export default function DayRow({ date }) {
    const globalContext = useContext(GlobalContext);

    return (
        <View style={styles.dayRow} >
            <View style={styles.dateTextContainer}>
                <Text>{DAY_NAMES_ABREV[date.getDay()]}, {date.getMonth()}/{date.getDate()}</Text>
            </View>
            <View style={styles.flatListContainer}>
                <FlatList
                    data={getEventsMatchingDate(globalContext.events, date)}
                    // Note to self: DO NOT DISREGARD THE KEY EXTRACTER! EVER!
                    numColumns={3}
                    renderItem={({ item }) => <EventTile event={item} />}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    dayRow: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 91, // 90 + borderBottomWidth
        borderColor: 'black',
        borderBottomWidth: 1,
    },
    dateTextContainer: {
        flex: 1,
        borderRightWidth: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    flatListContainer: {
        flex: 4,
        paddingLeft: 5,
        paddingTop: 5,
    },
});
