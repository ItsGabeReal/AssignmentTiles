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
import { EventDetails } from "../types/EventTypes";
import VisualSettings from "../src/VisualSettings"
import EventTile from './EventTile';

type DayRowProps = {
    date: DateYMD;
    events: EventDetails[];
    onPress?: ((gesture: GestureResponderEvent, rowDate: DateYMD) => void);
}

const DayRow: React.FC<DayRowProps> = (props) => {
    function handlePress(gesture: GestureResponderEvent) {
        props.onPress?.(gesture, props.date);
    }

    function renderEventTile({ item }: {item: EventDetails}) {
        return <EventTile event={item} plannedDate={props.date} />;
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={{ ...styles.dateTextContainer, backgroundColor: (props.date.isToday() ? "#ddf" : "#fff0") }}>
                    <Text>{props.date.dayNameAbrev()}</Text>
                    <Text>{props.date.monthNameAbrev()} {props.date.date}</Text>
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