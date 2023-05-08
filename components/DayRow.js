import { useContext, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Button,
    PanResponder,
} from "react-native";
import EventTile from './EventTile';
import EventContext from '../context/EventContext';

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

// export default function DayRow({ date, eventData }) {
export default function DayRow({ date }) {
    const viewRef = useRef(null);

    const context = useContext(EventContext);

    function getComponentDimensions() {
        viewRef.current.measure((x, y, width, height, pageX, pageY) => {
            console.log('x:', x);
            console.log('y:', y);
            console.log('width:', width);
            console.log('height:', height);
            console.log('pageX:', pageX);
            console.log('pageY:', pageY);
        })
    }

    return (
        <View
            ref={viewRef}
            style={styles.dayRow}
        >
            <View style={styles.dateTextContainer}>
                <Text>{DAY_NAMES_ABREV[date.getDay()]}, {date.getMonth()}/{date.getDate()}</Text>
            </View>
            <View style={styles.eventTileContainer}>
                <FlatList
                    data={getEventIndexesForDate(context.events, date)}
                    keyExtractor={item => item} // FlatLists are supposed to have a keyExtractor, but it seems to work fine without it
                    numColumns={3}
                    renderItem={({ item }) => <EventTile eventIndex={item} />}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    dayRow: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 90,
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
