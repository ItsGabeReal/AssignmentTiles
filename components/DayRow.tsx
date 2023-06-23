import React, { memo } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
import { EventTileCallbacks } from "../types/EventTypes";
import VisualSettings from "../src/VisualSettings"
import EventTile from './EventTile';
import { useAppSelector } from "../src/redux/hooks";
import InteractableEventTile from "./InteractableEventTile";
import { textStyles } from "../src/GlobalStyles";
import StdText from "./StdText";

type DayRowProps = {
    date: DateYMD;
    onPress?: ((gesture: GestureResponderEvent, rowDate: DateYMD) => void);
    eventTileCallbacks: EventTileCallbacks;
}

const DayRow: React.FC<DayRowProps> = memo((props) => {
    const rowPlan = useAppSelector(state => state.rowPlans.find(item => DateYMDHelpers.datesEqual(item.plannedDate, props.date)));
    const eventIDsInRow = rowPlan?.orderedEventIDs || [];

    function handlePress(gesture: GestureResponderEvent) {
        props.onPress?.(gesture, props.date);
    }

    function renderEventList() {
        const eventRows: string[][] = [];
        const numColumns = VisualSettings.DayRow.numEventTileColumns;

        for (let i = 0; i < eventIDsInRow.length; i++) {
            const eventID = eventIDsInRow[i];
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
        return <InteractableEventTile
            key={item}
            eventID={item}
            plannedDate={props.date}
            eventTileCallbacks={props.eventTileCallbacks}
        />
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={[styles.dateTextContainer, {backgroundColor: (DateYMDHelpers.isToday(props.date) ? "#44a" : "#444")} ]}>
                    <StdText type="h2">{DateYMDHelpers.dayNameAbrev(props.date)}</StdText>
                    <StdText>{DateYMDHelpers.monthNameAbrev(props.date)} {props.date.date}</StdText>
                </View>
                <View style={styles.eventsContainer}>
                    {renderEventList()}
                </View>
            </View>
        </TouchableOpacity>
    );
}, () => true);

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