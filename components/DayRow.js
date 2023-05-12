import { useContext } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
} from "react-native";
import EventTile from './EventTile';
import GlobalContext from "../context/GlobalContext";

const DAY_NAMES_ABREV = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function DayRow({ date, eventIDs }) {
    const globalContext = useContext(GlobalContext);
    
    function getEventFromID(events, id) {
        return events.find(item => (item.id == id));
    }

    return (
        <View style={styles.dayRow} >
            <View style={styles.dateTextContainer}>
                <Text>{DAY_NAMES_ABREV[date.getDay()]}, {date.getMonth()}/{date.getDate()}</Text>
            </View>
            <View style={styles.flatListContainer}>
                <FlatList
                    data={eventIDs}
                    numColumns={3}
                    keyExtractor={item => item}
                    renderItem={({ item }) => <EventTile event={getEventFromID(globalContext.events, item)} />}
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