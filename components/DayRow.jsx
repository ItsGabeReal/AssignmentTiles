import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { getItemFromID, datesMatch, today } from "../src/helpers";
import VisualSettings from "../src/VisualSettings"
import EventTile from './EventTile';

const DAY_NAMES_ABREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DayRow({ date, eventIDs, eventData, onPress }) {

    function isToday() {
        return datesMatch(today(), date)
    }
    
    function getEventFromID(events, id) {
        return getItemFromID(events, id);
    }
    
    function handlePress() {
        if (onPress) onPress(date);
    }

    function renderEventTile({ item }) {
        return <EventTile event={getEventFromID(eventData, item)} />;
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={{...styles.dateTextContainer, backgroundColor: (isToday() ? "#ddf" : "#fff0") }}>
                    <Text>{DAY_NAMES_ABREV[date.getDay()]}, {date.getMonth() + 1}/{date.getDate()}</Text>
                </View>
                <View style={styles.flatListContainer}>
                    <FlatList
                        data={eventIDs}
                        numColumns={VisualSettings.DayRow.numEventTileColumns}
                        keyExtractor={item => item}
                        renderItem={renderEventTile}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
        minHeight: VisualSettings.DayRow.flatListContainer.paddingTop + VisualSettings.EventTile.mainContainer.height + VisualSettings.EventTile.mainContainer.marginBottom,
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