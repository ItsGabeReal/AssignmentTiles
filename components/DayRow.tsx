import React, { memo } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import DateYMD from "../src/DateYMD";
import { EventTileCallbacks } from "../types/EventTypes";
import VisualSettings from "../src/VisualSettings"
import EventTile from './EventTile';
import { areEventsEqual } from "../src/EventsHelpers";

type DayRowProps = {
    date: DateYMD;
    eventIDs: string[];
    onPress?: ((gesture: GestureResponderEvent, rowDate: DateYMD) => void);
    eventTileCallbacks: EventTileCallbacks;
}

function propsAreEqual(prevProps: DayRowProps, newProps: DayRowProps) {
    if (prevProps.eventIDs.length !== newProps.eventIDs.length) return false;
    
    for (let i = 0; i < prevProps.eventIDs.length; i++) {
        if (prevProps.eventIDs[i] !== newProps.eventIDs[i]) return false;
    }

    return true;
}

const DayRow: React.FC<DayRowProps> = memo((props) => {
    function handlePress(gesture: GestureResponderEvent) {
        props.onPress?.(gesture, props.date);
    }

    function renderEventList() {
        const eventRows: string[][] = [];
        const numColumns = VisualSettings.DayRow.numEventTileColumns;

        for (let i = 0; i < props.eventIDs.length; i++) {
            const eventID = props.eventIDs[i];
            const rowIndex = Math.floor(i / numColumns);
            
            if (!eventRows[rowIndex]) eventRows[rowIndex] = [];

            eventRows[rowIndex].push(eventID);
        }

        return (
            <>
                {eventRows.map((row, index) => {
                    return (
                        <View key={index} style={styles.listRow}>
                            {row.map(event => renderItem({item: event}))}
                        </View>
                    )
                })}
            </>
        );
    }

    function renderItem({item}: { item: string }) {
        return <EventTile
            key={item}
            eventID={item}
            plannedDate={props.date}
            eventTileCallbacks={props.eventTileCallbacks}
        />
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={[styles.dateTextContainer, {backgroundColor: (props.date.isToday() ? "#44a" : "#444")} ]}>
                    <Text style={styles.dateText}>{props.date.dayNameAbrev()}</Text>
                    <Text style={styles.dateText}>{props.date.monthNameAbrev()} {props.date.date}</Text>
                </View>
                <View style={styles.eventsContainer}>
                    {renderEventList()}
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
        borderColor: '#aaa0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        color: '#fff',
    },
    eventsContainer: {
        flex: 1,
        paddingLeft: VisualSettings.DayRow.flatListContainer.paddingLeft,
        paddingTop: VisualSettings.DayRow.flatListContainer.paddingTop,
    },
    listRow: {
        flexDirection: 'row',
    }
});

export default DayRow;