import React, { useRef, useState, useReducer, useEffect, useContext } from "react";
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
import DateYMD from "../src/DateYMD";
import InfiniteScrollFlatList from "../components/core/InfiniteScrollFlatList";
import { Event, EventTileCallbacks, EventsOnDate } from "../types/EventTypes";
import { getEventFromID } from "../src/EventsHelpers";
import {
    visibleDaysReducer,
    initializeVisibleDays,
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
import EventsContext from "../context/EventsContext";
import { getEventPlan, getEventsOnDate, getInitialPlannedDateForEvent, rowEventsReducer } from "../src/RowEventsHelpers";
import { testRowEvents } from "../src/TestData";

export default function MainScreen() {
    const events = useContext(EventsContext);

    const [visibleDays, visibleDaysDispatch] = useReducer(visibleDaysReducer, initializeVisibleDays());
    const [rowEvents, rowEventsDispatch] = useReducer(rowEventsReducer, testRowEvents);

    const [eventCreatorVisible, setEventCreatorVisible] = useState(false);
    const [eventEditorVisible, setEventEditorVisible] = useState(false);

    const visibleDays_closureSafeRef = useRef(visibleDays);
    const rowEvents_closureSafeRef = useRef(rowEvents);
    const scrollYOffset = useRef(0);
    const eventCreator_initialDate = useRef<DateYMD>();
    const eventEditor_editedEvent = useRef<Event>();
    const flatListRef = useRef<FlatList<any> | null>(null);
    const contextMenuRef = useRef<ContextMenuContainerRef | null>(null);


    useEffect(() => {
        visibleDays_closureSafeRef.current = visibleDays;
        rowEvents_closureSafeRef.current = rowEvents;
    }, [visibleDays, rowEvents]);

    function onTilePressed_cb(gesture: GestureResponderEvent, event: Event) {
        events.dispatch({ type: 'toggle-event-complete', eventID: event.id });
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
        const rowEvents_CSR = rowEvents_closureSafeRef.current;

        const overlappingRowDate = getDayRowAtScreenPosition(visibleDays_CSR, rowEvents_CSR, scrollYOffset.current, { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY });
        if (!overlappingRowDate) {
            console.error('Could not find row overlapping drop position');
            return;
        }

        const targetVisibleDaysIndex = visibleDays_CSR.findIndex(item => item.equals(overlappingRowDate));
        if (targetVisibleDaysIndex == -1) {
            console.error('onTileDropped: Could not find visible day with date matching', overlappingRowDate.toString());
            return;
        }

        const insertionIndex = getInsertionIndexFromGesture(visibleDays_CSR, rowEvents_CSR, scrollYOffset.current, targetVisibleDaysIndex, gesture);

        rowEventsDispatch({ type: 'move-event', eventID: event.id, plannedDate: overlappingRowDate, insertionIndex: insertionIndex });
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
                        rowEventsDispatch({ type: 'remove-event', eventID: selectedEvent.id });
                        events.dispatch({ type: 'remove-event', eventID: selectedEvent.id });
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
        const eventPlan = getEventPlan(rowEvents, event.id);
        if (!eventPlan) {
            console.error(`MainScreen -> getContextMenuPositionForEventTile: Could not get event plan`);
            return;
        }

        const visibleDays_CSR = visibleDays_closureSafeRef.current;
        const rowEvents_CSR = rowEvents_closureSafeRef.current;

        const visibleDaysIndex = visibleDays_CSR.findIndex(item => item.equals(eventPlan.plannedDate));
        if (visibleDaysIndex == -1) {
            console.error(`MainScreen -> getContextMenuPositionForEventTile: Could not find visible day with date = ${eventPlan.plannedDate.toString()}`);
            return;
        }

        const rowYOffset = getDayRowScreenYOffset(visibleDays_CSR, rowEvents_CSR, scrollYOffset.current, visibleDaysIndex);

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
        const eventIDs = getEventsOnDate(rowEvents, item)?.orderedEventIDs || [];

        // In order for DayRow memo to know when a prop has changed, a COPY of events must be passed.
        // Otherwise we're passing down the same object reference it had before, hence every attribute
        // will be the same.
        const eventsIDsCopy = [...eventIDs];

        return <DayRow
            date={item}
            eventIDs={eventsIDsCopy}
            onPress={(gesture, rowDate) => openEventCreator(gesture, rowDate)}
            eventTileCallbacks={eventTileCallbacks}
        />;
    };

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(data: DateYMD[] | null | undefined, index: number) {
        return ({
            length: getDayRowHeight(rowEvents, visibleDays[index]),
            offset: getDayRowYOffset(visibleDays, rowEvents, index),
            index
        });
    }

    function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        scrollYOffset.current = event.nativeEvent.contentOffset.y;
    }

    function onStartReached() {
        visibleDaysDispatch({
            type: 'add-to-top',
            numNewDays: 7,
            removeFromBottom: true,
        });
    }

    function onEndReached() {
        visibleDaysDispatch({
            type: 'add-to-bottom',
            numNewDays: 7,
            removeFromTop: true,
        });
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
        console.log(rowEvents);
    }

    return (
        <View style={styles.container}>
            <StatusBar /*backgroundColor={'#0004'} */barStyle={"light-content"} /*translucent={true}*/ />
            <InfiniteScrollFlatList
                ref={flatListRef}
                data={visibleDays}
                keyExtractor={item => item.toString()}
                renderItem={renderItem}
                ItemSeparatorComponent={DayRowSeparater}
                getItemLayout={getItemLayout}
                initialScrollIndex={visibleDays.findIndex(item => item.isToday())}
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
                onEventCreated={createdEvent => {
                    const plannedDate = getInitialPlannedDateForEvent(createdEvent);
                    rowEventsDispatch({ type: 'insert-event', eventID: createdEvent.id, plannedDate });
                }}
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