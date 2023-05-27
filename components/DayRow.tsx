import React from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import { EventDetails } from "../types/EventTypes";
import { datesMatch, today } from "../src/GeneralHelpers";
import VisualSettings from "../src/VisualSettings"
import EventTile from './EventTile';

const DAY_NAMES_ABREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DayRowProps = {
    date: Date;
    events: EventDetails[];
    onPress?: ((gesture: GestureResponderEvent, rowDate: Date) => void);
}

const DayRow: React.FC<DayRowProps> = (props) => {
    function isToday() {
        return datesMatch(today(), props.date);
    }
    
    function handlePress(gesture: GestureResponderEvent) {
        props.onPress?.(gesture, props.date);
    }

    function renderEventTile({ item }: {item: EventDetails}) {
        return <EventTile event={item} />;
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={{...styles.dateTextContainer, backgroundColor: (isToday() ? "#ddf" : "#fff0") }}>
                    <Text>{DAY_NAMES_ABREV[props.date.getDay()]}, {props.date.getMonth() + 1}/{props.date.getDate()}</Text>
                </View>
                <View style={styles.flatListContainer}>
                    <FlatList
                        data={props.events}
                        numColumns={VisualSettings.DayRow.numEventTileColumns}
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