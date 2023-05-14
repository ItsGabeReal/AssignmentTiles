import { useContext } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
} from "react-native";
import EventTile from './EventTile';
import GlobalContext from "../context/GlobalContext";
import VisualSettings from "../json/VisualSettings.json"

const DAY_NAMES_ABREV = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function DayRow({ date, eventIDs }) {
    const globalContext = useContext(GlobalContext);
    
    function getEventFromID(events, id) {
        return events.find(item => (item.id == id));
    }

    return (
        <View style={styles.mainContainer} >
            <View style={styles.dateTextContainer}>
                <Text>{DAY_NAMES_ABREV[date.getDay()]}, {date.getMonth()}/{date.getDate()}</Text>
            </View>
            <View style={styles.flatListContainer}>
                <FlatList
                    data={eventIDs}
                    numColumns={VisualSettings.DayRow.numEventTileColumns}
                    keyExtractor={item => item}
                    renderItem={({ item }) => <EventTile event={getEventFromID(globalContext.events, item)} />}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
        minHeight: 91, // 90 (EventTile height) + 1 (borderBottomWidth)
        borderColor: 'black',
        borderBottomWidth: VisualSettings.DayRow.mainContainer.borderBottomWidth,
    },
    dateTextContainer: {
        width: VisualSettings.DayRow.dateTextContainer.width,
        borderRightWidth: VisualSettings.DayRow.dateTextContainer.borderRightWidth,
        justifyContent: 'center',
        alignItems: 'center'
    },
    flatListContainer: {
        flex: 1,
        paddingLeft: VisualSettings.DayRow.flatListContainer.paddingLeft,
        paddingTop: VisualSettings.DayRow.flatListContainer.paddingTop,
    },
});