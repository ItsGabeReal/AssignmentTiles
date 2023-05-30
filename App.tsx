import React, { useRef, useState, useReducer, useEffect } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    PanResponderGestureState,
    GestureResponderEvent,
    StatusBar,
} from "react-native";
import VisualSettings from "./src/VisualSettings";
import DateYMD from "./src/DateYMD";
import CallbackContext from "./context/CallbackContext"
import InfiniteScrollFlatList from "./components/InfiniteScrollFlatList";
import { EventDetails, RowEvents } from "./types/EventTypes";
import { eventDataReducer, getEventFromID, getRowEventsFromDate, printEventData } from "./src/EventDataHelpers";
import {
    visibleDaysReducer,
    initializeVisibleDays,
    getDayRowHeight,
    getDayRowYOffset,
    getDayRowAtScreenPosition,
    getInsertionIndexFromGesture,
    getEventTileDimensions,
    getDayRowScreenYOffset
} from "./src/VisibleDaysHelpers";
import TestButton from "./components/TestButton";
import DayRow from "./components/DayRow";
import EventCreator from "./components/EventCreator";
import EventEditor from "./components/EventEditor";
import ContextMenuContainer, { ContextMenuContainerRef } from "./components/ContextMenuContainer";
import { ContextMenuDetails, ContextMenuPosition } from "./components/ContextMenu";

const testEventData: RowEvents[] = [
    {
        date: DateYMD.today().subtractDays(5),
        events: [
            {
                name: 'Past Event',
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
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 2',
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 3',
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 4',
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 5',
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 6',
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Event 7',
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
        ],
    },
];

export default function App() {
    const [eventData, eventDataDispatch] = useReducer(eventDataReducer, testEventData);
    const [visibleDays, visibleDaysDispatch] = useReducer(visibleDaysReducer, initializeVisibleDays());
    
    const [scrollEnabled, setScrollEnabled] = useState(true);
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


    function onTileDragStart() {
        setScrollEnabled(false);
    }

    function onTileDropped(gesture: PanResponderGestureState, event: EventDetails) {
        setScrollEnabled(true);

        const visibleDays_CSR = visibleDays_closureSafeRef.current;

        const overlappingRowDate = getDayRowAtScreenPosition(visibleDays_CSR, eventData, scrollYOffset.current, { x: gesture.moveX, y: gesture.moveY });
        if (!overlappingRowDate) {
            console.error('Could not find row overlapping drop position');
            return;
        }
        
        const targetVisibleDaysIndex = visibleDays_CSR.findIndex(item => item.equals(overlappingRowDate));
        if (targetVisibleDaysIndex == -1) {
            console.error('onTileDropped: Could not find visible day with date matching', overlappingRowDate.toString());
            return;
        }

        const insertionIndex = getInsertionIndexFromGesture(visibleDays_CSR, eventData, scrollYOffset.current, targetVisibleDaysIndex, gesture);

        eventDataDispatch({ type: 'change-planned-date', eventID: event.id, newPlannedDate: overlappingRowDate, insertionIndex: insertionIndex })
    }

    function onTilePressed(gesture: GestureResponderEvent, eventDetails: EventDetails) {
        const contextMenuPosition = getContextMenuPositionForEventTile(eventDetails);
        if (!contextMenuPosition) {
            console.error(`App.tsx -> onTilePressed: Could not get context menu position`);
            return;
        }
        
        const testDetails: ContextMenuDetails = {
            options: [
                {
                    name: 'Edit',
                    onPress: () => openEventEditor(eventDetails),
                    iconName: 'pencil',
                },
                {
                    name: 'Delete',
                    onPress: () => eventDataDispatch({ type: 'remove', eventID: eventDetails.id}),
                    iconName: 'trash',
                    color: '#d00',
                },
            ],
            position: contextMenuPosition,
        }

        contextMenuRef.current?.create(testDetails);
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

    function openEventCreator(gesture: GestureResponderEvent, initialDate?: DateYMD) {
        eventCreator_initialDate.current = initialDate;
        setEventCreatorVisible(true);
    }

    function openEventEditor(editedEvent: EventDetails) {
        eventEditor_eventDetails.current = editedEvent;
        setEventEditorVisible(true);
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
        printEventData(eventData);
    }

    function renderDayRow({ item }: { item: DateYMD }) {
        const events = getRowEventsFromDate(eventData, item)?.events || [];

        return <DayRow date={item} events={events} onPress={(gesture, rowDate) => openEventCreator(gesture, rowDate)} />;
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#fffb'} barStyle={"dark-content"} /*translucent={true}*/ />
            <CallbackContext.Provider value={{ onTileDragStart: onTileDragStart, onTileDropped: onTileDropped, onTilePressed: onTilePressed }}>
                <InfiniteScrollFlatList
                    ref={flatListRef}
                    data={visibleDays}
                    keyExtractor={item => item.toString()}
                    renderItem={renderDayRow}
                    ItemSeparatorComponent={DayRowSeparater}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={visibleDays.findIndex(item => item.isToday())}
                    scrollEnabled={scrollEnabled}
                    onScroll={event => scrollYOffset.current = event.nativeEvent.contentOffset.y}
                    onStartReached={onStartReached}
                    onEndReached={onEndReached}
                    showsVerticalScrollIndicator={false}
                />
            </CallbackContext.Provider>
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
            <TestButton onPress={onTestButtonPressed} />
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