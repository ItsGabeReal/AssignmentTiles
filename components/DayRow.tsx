import React, { memo } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    GestureResponderEvent,
} from "react-native";
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
import VisualSettings from "../src/VisualSettings"
import { useAppSelector } from "../src/redux/hooks";
import InteractableEventTile from "./InteractableEventTile";
import { colors, fontSizes } from "../src/GlobalStyles";
import { EventTileCallbacks } from "../types/General";

type DayRowProps = {
    /**
     * The date this row represents.
     */
    date: DateYMD;

    /**
     * Called when the row is pressed.
     */
    onPress?: ((gesture: GestureResponderEvent, rowDate: DateYMD) => void);
}

const DayRow: React.FC<DayRowProps> = memo((props) => {
    const rowPlan = useAppSelector(state => state.rowPlans.find(item => DateYMDHelpers.datesEqual(item.plannedDate, props.date)));
    const eventIDsInRow = rowPlan?.orderedEventIDs || [];
    const isToday = DateYMDHelpers.isToday(props.date);

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
        />
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.mainContainer}>
                <View style={[styles.dateTextContainer, { backgroundColor: (isToday ? colors.todayL2 : colors.l2) }]}>
                    <Text style={styles.dayNameText}>{DateYMDHelpers.dayNameAbrev(props.date)}</Text>
                    <Text style={styles.dateText}>{isToday ? 'Today' : `${DateYMDHelpers.monthNameAbrev(props.date)} ${props.date.date}`}</Text>
                </View>
                <View style={[styles.eventsContainer, { backgroundColor: (isToday ? colors.todayL1 : colors.l1) }]}>
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
        padding: 8,
    },
    dayNameText: {
        fontSize: fontSizes.title,
        color: colors.text,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: fontSizes.h3,
        color: colors.text,
        opacity: 0.5,
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