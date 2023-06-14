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
import { EventDetails, EventTileCallbacks } from "../types/EventTypes";
import { getEventFromID, getRowEventsFromDate, printEventData } from "../src/EventDataHelpers";
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
import EventDataContext from "../context/EventDataContext";

export default function MainScreen() {
    const eventData = useContext(EventDataContext);
    const [visibleDays, visibleDaysDispatch] = useReducer(visibleDaysReducer, initializeVisibleDays());

    const [eventCreatorVisible, setEventCreatorVisible] = useState(false);
    const [eventEditorVisible, setEventEditorVisible] = useState(false);

    const visibleDays_closureSafeRef = useRef(visibleDays);
    const scrollYOffset = useRef(0);
    const eventCreator_initialDate = useRef<DateYMD>();
    const eventEditor_eventDetails = useRef<EventDetails>();
    const flatListRef = useRef<FlatList<any> | null>(null);
    const contextMenuRef = useRef<ContextMenuContainerRef | null>(null);


    useEffect(() => {
        visibleDays_closureSafeRef.current = visibleDays;
    }, [visibleDays]);

    function onTilePressed_cb(gesture: GestureResponderEvent, eventDetails: EventDetails) {
        eventData.dispatch({ type: 'toggle-complete', targetEventID: eventDetails.id });
    }

    function onTileLongPressed_cb(gesture: GestureResponderEvent, eventDetails: EventDetails) {
        flatListRef.current?.setNativeProps({ scrollEnabled: false });
        openEventTileContextMenu(eventDetails);
    }

    function onTileLongPressRelease_cb() {
        flatListRef.current?.setNativeProps({ scrollEnabled: true });
    }

    function onTileDragStart_cb() {
        contextMenuRef.current?.close();
    }

    function onTileDropped_cb(gesture: GestureResponderEvent, event: EventDetails) {
        const visibleDays_CSR = visibleDays_closureSafeRef.current;
        const eventData_CSR = eventData.closureSafeRef.current;

        const overlappingRowDate = getDayRowAtScreenPosition(visibleDays_CSR, eventData_CSR, scrollYOffset.current, { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY });
        if (!overlappingRowDate) {
            console.error('Could not find row overlapping drop position');
            return;
        }

        const targetVisibleDaysIndex = visibleDays_CSR.findIndex(item => item.equals(overlappingRowDate));
        if (targetVisibleDaysIndex == -1) {
            console.error('onTileDropped: Could not find visible day with date matching', overlappingRowDate.toString());
            return;
        }

        const insertionIndex = getInsertionIndexFromGesture(visibleDays_CSR, eventData_CSR, scrollYOffset.current, targetVisibleDaysIndex, gesture);

        eventData.dispatch({ type: 'change-planned-date', eventID: event.id, newPlannedDate: overlappingRowDate, insertionIndex: insertionIndex });
    }

    function openEventTileContextMenu(eventDetails: EventDetails) {
        const contextMenuPosition = getContextMenuPositionForEventTile(eventDetails);
        if (!contextMenuPosition) {
            console.error(`App.tsx -> openEventTileContextMenu: Could not get context menu position`);
            return;
        }

        const contextMenuDetails: ContextMenuDetails = {
            options: [
                {
                    name: 'Edit',
                    onPress: () => openEventEditor(eventDetails),
                    iconName: 'pencil',
                },
                {
                    name: 'Delete',
                    onPress: () => eventData.dispatch({ type: 'remove', eventID: eventDetails.id }),
                    iconName: 'trash',
                    color: '#d00',
                },
            ],
            position: contextMenuPosition,
        }

        contextMenuRef.current?.create(contextMenuDetails);
    }

    function getContextMenuPositionForEventTile(eventDetails: EventDetails) {
        const event = getEventFromID(eventData.closureSafeRef.current, eventDetails.id);
        if (!event) {
            console.error(`App.tsx -> getContextMenuPositionForEventTile: Could not find event with id = ${eventDetails.id}`);
            return;
        }

        const visibleDays_CSR = visibleDays_closureSafeRef.current;

        const visibleDaysIndex = visibleDays_CSR.findIndex(item => item.equals(event.plannedDate));
        if (visibleDaysIndex == -1) {
            console.error(`App.tsx -> getContextMenuPositionForEventTile: Could not find visible day with date = ${event.plannedDate.toString()}`);
            return;
        }

        const rowYOffset = getDayRowScreenYOffset(visibleDays_CSR, eventData.closureSafeRef.current, scrollYOffset.current, visibleDaysIndex);

        const eventTileDimensions = getEventTileDimensions(rowYOffset, event.rowOrder);

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
        const events = getRowEventsFromDate(eventData.state, item)?.events || []; // Could be in day row

        // In order for DayRow memo to know when a prop has changed, a COPY of events must be passed.
        // Otherwise we're passing down the same object reference it had before, hence every attribute
        // will be the same.
        const eventsCopy: EventDetails[] = [];
        events.forEach(item => eventsCopy.push({ ...item }));

        return <DayRow
            date={item}
            events={eventsCopy}
            onPress={(gesture, rowDate) => openEventCreator(gesture, rowDate)}
            eventTileCallbacks={eventTileCallbacks}
        />;
    };

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(data: DateYMD[] | null | undefined, index: number) {
        return ({
            length: getDayRowHeight(eventData.state, visibleDays[index]),
            offset: getDayRowYOffset(visibleDays, eventData.state, index),
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

    function openEventEditor(editedEvent: EventDetails) {
        eventEditor_eventDetails.current = editedEvent;
        setEventEditorVisible(true);
    }

    function onTestButtonPressed() {
        console.log('eventData:');
        printEventData(eventData.state);
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
            />
            <EventEditor
                visible={eventEditorVisible}
                onRequestClose={() => setEventEditorVisible(false)}
                editedEvent={eventEditor_eventDetails.current}
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