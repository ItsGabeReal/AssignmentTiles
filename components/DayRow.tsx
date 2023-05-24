import React from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import { Row } from "../types/RowTypes";
import { Event, EventID } from "../types/EventTypes";
import { getItemFromID, datesMatch, today } from "../src/helpers";
import VisualSettings from "../src/VisualSettings"
import EventTile from './EventTile';

const DAY_NAMES_ABREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayRowProps = {
    row: Row;
    eventData: Event[];
    onPress?: ((gesture: GestureResponderEvent, row: Row) => void);
}

const DayRow: React.FC<DayRowProps> = (props) => {
    function isToday(): boolean {
        return datesMatch(today(), props.row.date);
    }
    
    function getEventFromID(events: Event[], id: EventID): Event {
        return getItemFromID(events, id);
    }
    
    function handlePress(gesture: GestureResponderEvent) {
        props.onPress?.(gesture, props.row);
    }

    function renderEventTile({ item }: {item: EventID}) {
        return <EventTile event={getEventFromID(props.eventData, item)} />;
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={{...styles.dateTextContainer, backgroundColor: (isToday() ? "#ddf" : "#fff0") }}>
                    <Text>{DAY_NAMES_ABREV[props.row.date.getDay()]}, {props.row.date.getMonth() + 1}/{props.row.date.getDate()}</Text>
                </View>
                <View style={styles.flatListContainer}>
                    <FlatList
                        data={props.row.eventIDs}
                        numColumns={VisualSettings.DayRow.numEventTileColumns}
                        keyExtractor={item => item.toString()}
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

export default DayRow;