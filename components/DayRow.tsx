import React, { memo } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import DateYMD from "../src/DateYMD";
import { EventDetails, EventTileCallbacks } from "../types/EventTypes";
import VisualSettings from "../src/VisualSettings"
import EventTile from './EventTile';

type DayRowProps = {
    date: DateYMD;
    events: EventDetails[];
    onPress?: ((gesture: GestureResponderEvent, rowDate: DateYMD) => void);
    eventTileCallbacks: EventTileCallbacks;
}

function propsAreEqual(prevProps: DayRowProps, newProps: DayRowProps) {
    if (prevProps.events.length !== newProps.events.length) return false;
    
    for (let i = 0; i < prevProps.events.length; i++) {
        if (prevProps.events[i].completed !== newProps.events[i].completed ||
            prevProps.events[i].dueDate != newProps.events[i].dueDate ||
            prevProps.events[i].name != newProps.events[i].name
        ) {
            return false;
        }
    }

    return true;
}

const DayRow: React.FC<DayRowProps> = memo((props) => {
    //console.log(`${props.date.toString()} rendered`);
    function handlePress(gesture: GestureResponderEvent) {
        props.onPress?.(gesture, props.date);
    }

    function renderEventTile({ item }: {item: EventDetails}) {
        return <EventTile event={item} plannedDate={props.date} eventTileCallbacks={props.eventTileCallbacks} />;
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={[styles.dateTextContainer, {backgroundColor: (props.date.isToday() ? "#44a" : "#444")} ]}>
                    <Text style={styles.dateText}>{props.date.dayNameAbrev()}</Text>
                    <Text style={styles.dateText}>{props.date.monthNameAbrev()} {props.date.date}</Text>
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
}, propsAreEqual);

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'row',
        minHeight: VisualSettings.DayRow.flatListContainer.paddingTop + VisualSettings.EventTile.mainContainer.height + VisualSettings.EventTile.mainContainer.marginBottom,
    },
    dateTextContainer: {
        width: VisualSettings.DayRow.dateTextContainer.width,
        borderRightWidth: VisualSettings.DayRow.dateTextContainer.borderRightWidth,
        borderColor: '#aaa0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        color: '#fff',
    },
    flatListContainer: {
        flex: 1,
        paddingLeft: VisualSettings.DayRow.flatListContainer.paddingLeft,
        paddingTop: VisualSettings.DayRow.flatListContainer.paddingTop,
    },
});

export default DayRow;