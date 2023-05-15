import { useContext } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
} from "react-native";
import EventTile from './EventTile';
import GlobalContext from "../context/GlobalContext";
import VisualSettings from "../json/VisualSettings.json"

const DAY_NAMES_ABREV = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function DayRow({ date, eventIDs, onPress }) {
    const globalContext = useContext(GlobalContext);
    
    function getEventFromID(events, id) {
        return events.find(item => (item.id == id));
    }
    
    function handlePress() {
        if (onPress) onPress(date);
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={styles.dateTextContainer}>
                    <Text>{DAY_NAMES_ABREV[date.getDay()]}, {date.getMonth() + 1}/{date.getDate()}</Text>
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
        minHeight: VisualSettings.DayRow.flatListContainer.paddingTop + VisualSettings.EventTile.mainContainer.height + VisualSettings.EventTile.mainContainer.marginBottom,
        borderColor: 'black',
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