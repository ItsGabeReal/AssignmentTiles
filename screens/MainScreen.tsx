import React, { useRef, useState, useReducer, useEffect, useContext, useCallback } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    GestureResponderEvent,
    StatusBar,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import VisualSettings from "../src/VisualSettings";
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
import InfiniteScrollFlatList from "../components/core/InfiniteScrollFlatList";
import { Event, EventTileCallbacks } from "../types/EventTypes";
import {
    getDayRowHeight,
    getDayRowYOffset,
    getDayRowAtScreenPosition,
    getInsertionIndexFromGesture,
    getEventTileDimensions,
    getDayRowScreenYOffset,
} from "../src/VisibleDaysHelpers";
import DayRow from "../components/DayRow";
import EventCreator from "../components/EventCreator";
import EventEditor from "../components/EventEditor";
import ContextMenuContainer, { ContextMenuContainerRef } from "../components/ContextMenuContainer";
import { ContextMenuDetails, ContextMenuPosition } from "../components/ContextMenu";
import TestButton from "../components/core/TestButton";
import { useAppSelector, useAppDispatch } from "../src/redux/hooks";
import { removeEvent, toggleEventComplete } from "../src/redux/features/events/eventsSlice";
import { changePlannedDate, getEventPlan, removeEventFromRowPlans } from "../src/redux/features/rowPlans/rowPlansSlice";
import { addDaysToBottom, addDaysToTop } from "../src/redux/features/visibleDays/visibleDaysSlice";

export default function MainScreen() {
    const dispatch = useAppDispatch();

    const visibleDays = useAppSelector(state => state.visibleDays);
    const rowPlans = useAppSelector(state => state.rowPlans);

    const [eventCreatorVisible, setEventCreatorVisible] = useState(false);
    const [eventEditorVisible, setEventEditorVisible] = useState(false);

    const visibleDays_closureSafeRef = useRef(visibleDays);
    const rowPlans_closureSafeRef = useRef(rowPlans);
    const scrollYOffset = useRef(0);
    const eventCreator_initialDate = useRef<DateYMD>();
    const eventEditor_editedEvent = useRef<Event>();
    const flatListRef = useRef<FlatList<any> | null>(null);
    const contextMenuRef = useRef<ContextMenuContainerRef | null>(null);


    useEffect(() => {
        visibleDays_closureSafeRef.current = visibleDays;
        rowPlans_closureSafeRef.current = rowPlans;
    }, [visibleDays, rowPlans]);

    function onTilePressed_cb(gesture: GestureResponderEvent, event: Event) {
        dispatch(toggleEventComplete({eventID: event.id}));
    }

    function onTileLongPressed_cb(gesture: GestureResponderEvent, event: Event) {
        flatListRef.current?.setNativeProps({ scrollEnabled: false });
        openEventTileContextMenu(event);
    }

    function onTileLongPressRelease_cb() {
        flatListRef.current?.setNativeProps({ scrollEnabled: true });
    }

    function onTileDragStart_cb() {
        contextMenuRef.current?.close();
    }

    function onTileDropped_cb(gesture: GestureResponderEvent, event: Event) {
        const visibleDays_CSR = visibleDays_closureSafeRef.current;
        const rowPlans_CSR = rowPlans_closureSafeRef.current;

        const overlappingRowDate = getDayRowAtScreenPosition(visibleDays_CSR, rowPlans_CSR, scrollYOffset.current, { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY });
        if (!overlappingRowDate) {
            console.error('Could not find row overlapping drop position');
            return;
        }

        const targetVisibleDaysIndex = visibleDays_CSR.findIndex(item => DateYMDHelpers.datesEqual(item, overlappingRowDate));
        if (targetVisibleDaysIndex == -1) {
            console.error('onTileDropped: Could not find visible day with date matching', DateYMDHelpers.toString(overlappingRowDate));
            return;
        }

        const insertionIndex = getInsertionIndexFromGesture(visibleDays_CSR, rowPlans_CSR, scrollYOffset.current, targetVisibleDaysIndex, gesture);

        dispatch(changePlannedDate({eventID: event.id, plannedDate: overlappingRowDate, insertionIndex: insertionIndex}));
    }

    function openEventTileContextMenu(selectedEvent: Event) {
        const contextMenuPosition = getContextMenuPositionForEventTile(selectedEvent);
        if (!contextMenuPosition) {
            console.error(`MainScreen -> openEventTileContextMenu: Could not get context menu position`);
            return;
        }

        const contextMenuDetails: ContextMenuDetails = {
            options: [
                {
                    name: 'Edit',
                    onPress: () => openEventEditor(selectedEvent),
                    iconName: 'pencil',
                },
                {
                    name: 'Delete',
                    onPress: () => {
                        dispatch(removeEventFromRowPlans({eventID: selectedEvent.id}));
                        dispatch(removeEvent({eventID: selectedEvent.id}));
                    },
                    iconName: 'trash',
                    color: '#d00',
                },
            ],
            position: contextMenuPosition,
        }

        contextMenuRef.current?.create(contextMenuDetails);
    }

    function getContextMenuPositionForEventTile(event: Event) {
        const visibleDays_CSR = visibleDays_closureSafeRef.current;
        const rowPlans_CSR = rowPlans_closureSafeRef.current;

        const eventPlan = getEventPlan(rowPlans_CSR, event.id);
        if (!eventPlan) {
            console.error(`MainScreen -> getContextMenuPositionForEventTile: Could not get event plan`);
            return;
        }

        const visibleDaysIndex = visibleDays_CSR.findIndex(item => DateYMDHelpers.datesEqual(item, eventPlan.plannedDate));
        if (visibleDaysIndex == -1) {
            console.error(`MainScreen -> getContextMenuPositionForEventTile: Could not find visible day with date = ${DateYMDHelpers.toString(eventPlan.plannedDate)}`);
            return;
        }

        const rowYOffset = getDayRowScreenYOffset(visibleDays_CSR, rowPlans_CSR, scrollYOffset.current, visibleDaysIndex);

        const eventTileDimensions = getEventTileDimensions(rowYOffset, eventPlan.rowOrder);

        const xMidpoint = eventTileDimensions.x + eventTileDimensions.width / 2;

        const output: ContextMenuPosition = {
            x: xMidpoint,
            topY: eventTileDimensions.y,
            bottomY: eventTileDimensions.y + eventTileDimensions.height,
        };

        return output;
    }

    const eventTileCallbacks: EventTileCallbacks = {
        onTilePressed: onTilePressed_cb,
        onTileLongPressed: onTileLongPressed_cb,
        onTileLongPressRelease: onTileLongPressRelease_cb,
        onTileDragStart: onTileDragStart_cb,
        onTileDropped: onTileDropped_cb,
    }

    function renderItem({ item }: { item: DateYMD }) {
        return <DayRow
            date={item}
            onPress={(gesture, rowDate) => openEventCreator(gesture, rowDate)}
            eventTileCallbacks={eventTileCallbacks}
        />;
    };

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(data: DateYMD[] | null | undefined, index: number) {
        return ({
            length: getDayRowHeight(rowPlans, visibleDays[index]),
            offset: getDayRowYOffset(visibleDays, rowPlans, index),
            index
        });
    }

    function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        scrollYOffset.current = event.nativeEvent.contentOffset.y;
    }

    function onStartReached() {
        dispatch(addDaysToTop({ numNewDays: 7, removeFromBottom: true}));
    }

    function onEndReached() {
        dispatch(addDaysToBottom({numNewDays: 7, removeFromTop: true}));
    }

    function openEventCreator(gesture: GestureResponderEvent, initialDate?: DateYMD) {
        eventCreator_initialDate.current = initialDate;
        setEventCreatorVisible(true);
    }

    function openEventEditor(editedEvent: Event) {
        eventEditor_editedEvent.current = editedEvent;
        setEventEditorVisible(true);
    }

    function onTestButtonPressed() {
        
    }

    return (
        <View style={styles.container}>
            <StatusBar /*backgroundColor={'#0004'} */barStyle={"light-content"} /*translucent={true}*/ />
            <InfiniteScrollFlatList
                ref={flatListRef}
                data={visibleDays}
                keyExtractor={item => DateYMDHelpers.toString(item)}
                renderItem={renderItem}
                ItemSeparatorComponent={DayRowSeparater}
                getItemLayout={getItemLayout}
                initialScrollIndex={visibleDays.findIndex(item => DateYMDHelpers.isToday(item))}
                //scrollEnabled <- Instead of using a state here, I'm using flatListRef.setNativeProps({ scrollEnabled: true/false }). This way changing it doesn't cause a rerender.
                onScroll={onScroll}
                onStartReached={onStartReached}
                onEndReached={onEndReached}
                maintainVisibleContentPosition={{minIndexForVisible: 0}}
                showsVerticalScrollIndicator={false}
            />
            <ContextMenuContainer ref={contextMenuRef} />
            <EventCreator
                visible={eventCreatorVisible}
                onRequestClose={() => setEventCreatorVisible(false)}
                initialDueDate={eventCreator_initialDate.current}
            />
            <EventEditor
                visible={eventEditorVisible}
                onRequestClose={() => setEventEditorVisible(false)}
                editedEvent={eventEditor_editedEvent.current}
            />
            {<TestButton onPress={onTestButtonPressed} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#222",
        flex: 1
    },
    dayRowSeparater: {
        backgroundColor: '#666',
        height: VisualSettings.App.dayRowSeparater.height,
        zIndex: 1,
    }
});