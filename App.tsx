import React, { useRef, useState, useReducer, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    GestureResponderEvent,
    StatusBar,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import VisualSettings from "./src/VisualSettings";
import DateYMD from "./src/DateYMD";
import InfiniteScrollFlatList from "./components/InfiniteScrollFlatList";
import { EventDetails, RowEvents, EventTileCallbacks } from "./types/EventTypes";
import { eventDataReducer, getEventFromID, getRowEventsFromDate, printEventData } from "./src/EventDataHelpers";
import {
    visibleDaysReducer,
    initializeVisibleDays,
    getDayRowHeight,
    getDayRowYOffset,
    getDayRowAtScreenPosition,
    getInsertionIndexFromGesture,
    getEventTileDimensions,
    getDayRowScreenYOffset,
} from "./src/VisibleDaysHelpers";
import DayRow from "./components/DayRow";
import EventCreator from "./components/EventCreator";
import EventEditor from "./components/EventEditor";
import ContextMenuContainer, { ContextMenuContainerRef } from "./components/ContextMenuContainer";
import { ContextMenuDetails, ContextMenuPosition } from "./components/ContextMenu";
import TestButton from "./components/TestButton";

const testEventData: RowEvents[] = [
    {
        date: DateYMD.today().subtractDays(5),
        events: [
            {
                name: 'Past Event',
                completed: true,
                id: Math.random().toString(),
                dueDate: DateYMD.today().subtractDays(5),
            },
        ]
    },
    {
        date: DateYMD.today(),
        events: [
            {
                name: 'Event 1',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 2',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 3',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 4',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
        ],
    },
];

export default function App() {
    const [eventData, eventDataDispatch] = useReducer(eventDataReducer, testEventData);
    const [visibleDays, visibleDaysDispatch] = useReducer(visibleDaysReducer, initializeVisibleDays());

    const [eventCreatorVisible, setEventCreatorVisible] = useState(false);
    const [eventEditorVisible, setEventEditorVisible] = useState(false);
    
    const eventData_closureSafeRef = useRef(eventData);
    const visibleDays_closureSafeRef = useRef(visibleDays);
    const scrollYOffset = useRef(0);
    const eventCreator_initialDate = useRef<DateYMD>();
    const eventEditor_eventDetails = useRef<EventDetails>();
    const flatListRef = useRef<FlatList<any> | null>(null);
    const contextMenuRef = useRef<ContextMenuContainerRef | null>(null);
    

    useEffect(() => {
        eventData_closureSafeRef.current = eventData;
        visibleDays_closureSafeRef.current = visibleDays;
    }, [eventData, visibleDays]);


    function onTilePressed(gesture: GestureResponderEvent, eventDetails: EventDetails) {
        eventDataDispatch({ type: 'toggle-complete', targetEventID: eventDetails.id });
    }

    function onTileLongPressed(gesture: GestureResponderEvent, eventDetails: EventDetails) {
        flatListRef.current?.setNativeProps({ scrollEnabled: false });
        openEventTileContextMenu(eventDetails);
    }

    function onTileLongPressRelease() {
        flatListRef.current?.setNativeProps({ scrollEnabled: true });
    }

    function onTileDragStart() {
        contextMenuRef.current?.close();
    }

    function onTileDropped(gesture: GestureResponderEvent, event: EventDetails) {
        const eventData_CSR = eventData_closureSafeRef.current;
        const visibleDays_CSR = visibleDays_closureSafeRef.current;

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

        eventDataDispatch({ type: 'change-planned-date', eventID: event.id, newPlannedDate: overlappingRowDate, insertionIndex: insertionIndex })
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
                    onPress: () => eventDataDispatch({ type: 'remove', eventID: eventDetails.id }),
                    iconName: 'trash',
                    color: '#d00',
                },
            ],
            position: contextMenuPosition,
        }

        contextMenuRef.current?.create(contextMenuDetails);
    }

    function getContextMenuPositionForEventTile(eventDetails: EventDetails) {
        const event = getEventFromID(eventData, eventDetails.id);
        if (!event) {
            console.error(`App.tsx -> getContextMenuPositionForEventTile: Could not find event with id = ${eventDetails.id}`);
            return;
        }

        const visibleDaysIndex = visibleDays.findIndex(item => item.equals(event.plannedDate));
        if (visibleDaysIndex == -1) {
            console.error(`App.tsx -> getContextMenuPositionForEventTile: Could not find visible day with date = ${event.plannedDate.toString()}`);
            return;
        }

        const rowYOffset = getDayRowScreenYOffset(visibleDays, eventData, scrollYOffset.current, visibleDaysIndex);

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
        onTilePressed: onTilePressed,
        onTileLongPressed: onTileLongPressed,
        onTileLongPressRelease: onTileLongPressRelease,
        onTileDragStart: onTileDragStart,
        onTileDropped: onTileDropped
    }

    function renderItem({ item }: { item: DateYMD }) {
        const events = getRowEventsFromDate(eventData, item)?.events || [];

        // In order for DayRow memo to know when a prop has changed, a COPY of events must be passed.
        // Otherwise we're passing down the same object reference it had before, hence every attribute
        // will be the same.
        const eventsCopy: EventDetails[] = [];
        for (let i = 0; i < events.length; i++) {
            const eventCopy = {...events[i]};
            eventsCopy.push(eventCopy);
        }

        return <DayRow date={item} events={eventsCopy} onPress={(gesture, rowDate) => openEventCreator(gesture, rowDate)} eventTileCallbacks={eventTileCallbacks} />;
    }

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(data: DateYMD[] | null | undefined, index: number) {
        return ({
            length: getDayRowHeight(eventData, visibleDays[index]),
            offset: getDayRowYOffset(visibleDays, eventData, index),
            index
        });
    }

    function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        scrollYOffset.current = event.nativeEvent.contentOffset.y;
        //contextMenuRef.current?.close();
    }

    function onStartReached() {
        visibleDaysDispatch({
            type: 'add-to-top',
            numNewDays: 7,
            removeFromBottom: true,
        });

        flatListRef.current?.scrollToIndex({
            index: 7,
            animated: false,
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

    function onEventCreatorSubmitted(newEvent: EventDetails) {
        eventDataDispatch({
            type: 'add',
            newEvent: newEvent,
        });
    }

    function onEventEditorSubmitted(editedEvent: EventDetails) {
        eventDataDispatch({
            type: 'set-event-details',
            targetEventID: editedEvent.id,
            newEventDetails: editedEvent
        });
    }

    function onTestButtonPressed() {
        console.log('eventData:');
        printEventData(eventData);
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#fffb'} barStyle={"dark-content"} /*translucent={true}*/ />
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
                showsVerticalScrollIndicator={false}
            />
            <ContextMenuContainer ref={contextMenuRef} />
            <EventCreator
                visible={eventCreatorVisible}
                onRequestClose={() => setEventCreatorVisible(false)}
                initialDueDate={eventCreator_initialDate.current}
                onSubmit={onEventCreatorSubmitted}
            />
            <EventEditor
                visible={eventEditorVisible}
                onRequestClose={() => setEventEditorVisible(false)}
                editedEvent={eventEditor_eventDetails.current}
                onSubmit={onEventEditorSubmitted}
            />
            {<TestButton onPress={onTestButtonPressed} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1
    },
    dayRowSeparater: {
        backgroundColor: '#000',
        height: VisualSettings.App.dayRowSeparater.height,
        zIndex: 1,
    }
});