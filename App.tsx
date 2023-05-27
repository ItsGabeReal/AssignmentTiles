import React, { useRef, useState, useReducer } from "react";
import {
    StyleSheet,
    View,
    Modal,
    FlatList,
    PanResponderGestureState,
    GestureResponderEvent,
    StatusBar,
} from "react-native";
import { EventDetails, RowEvents } from "./types/EventTypes";
import VisualSettings from "./src/VisualSettings";
import CallbackContext from "./context/CallbackContext"
import InfiniteScrollFlatList from "./components/InfiniteScrollFlatList";
import TestButton from "./components/TestButton";
import DayRow from "./components/DayRow";
import EventCreator from "./components/EventCreator";
import { eventDataReducer, getRowEventsFromDate } from "./src/EventDataHelpers";
import {
    visibleDaysReducer,
    initializeVisibleDays,
    getDayRowHeight,
    getDayRowYOffset,
    getDayRowAtScreenPosition,
    getInsertionIndexFromGesture
} from "./src/VisibleDaysHelpers";
import { datesMatch, today } from "./src/GeneralHelpers";

const testEventData: RowEvents[] = [
    {
        date: new Date(2023, 4, 20),
        events: [
            {
                name: 'Past Event',
                id: Math.random().toString(),
                dueDate: new Date(2023, 4, 20),
            },
        ]
    },
    {
        date: new Date(),
        events: [
            {
                name: 'Event 1',
                id: Math.random().toString(),
                dueDate: new Date(),
            },
            {
                name: 'Event 2',
                id: Math.random().toString(),
                dueDate: new Date(),
            },
            {
                name: 'Event 3',
                id: Math.random().toString(),
                dueDate: new Date(),
            },
            {
                name: 'Event 4',
                id: Math.random().toString(),
                dueDate: new Date(),
            },
            {
                name: 'Event 5',
                id: Math.random().toString(),
                dueDate: new Date(),
            },
            {
                name: 'Event 6',
                id: Math.random().toString(),
                dueDate: new Date(),
            },
            {
                name: 'Event 7',
                id: Math.random().toString(),
                dueDate: new Date(),
            },
        ],
    },
];

export default function App() {
    const [eventData, eventDataDispatch] = useReducer(eventDataReducer, testEventData);
    const [visibleDays, visibleDaysDispatch] = useReducer(visibleDaysReducer, initializeVisibleDays());

    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [eventCreatorModalVisible, setEventCreatorModalVisible] = useState(false);

    const scrollYOffset = useRef(0);
    const eventCreatorInitialDate = useRef<Date>();
    const flatListRef = useRef<FlatList<any> | null>(null);


    function onTileDragStart() {
        setScrollEnabled(false);
    }

    function onTileDropped(gesture: PanResponderGestureState, event: EventDetails) {
        setScrollEnabled(true);

        const overlappingRowDate = getDayRowAtScreenPosition(visibleDays, eventData, scrollYOffset.current, { x: gesture.moveX, y: gesture.moveY });
        if (!overlappingRowDate) {
            console.error('Could not find row overlapping drop position');
            return;
        }

        const targetVisibleDaysIndex = visibleDays.findIndex(item => datesMatch(item, overlappingRowDate));
        if (!targetVisibleDaysIndex) {
            console.error('Could not find visible day with date matching', overlappingRowDate);
            return;
        }

        const insertionIndex = getInsertionIndexFromGesture(visibleDays, eventData, scrollYOffset.current, targetVisibleDaysIndex, gesture);

        eventDataDispatch({ type: 'change-planned-date', eventID: event.id, newPlannedDate: overlappingRowDate, insertionIndex: insertionIndex })
    }

    function onTilePressed(gesture: GestureResponderEvent, event: EventDetails) {
        console.log('removing', event.name);
        eventDataDispatch({ type: 'remove', eventID: event.id });
    }

    function openEventCreator(gesture: GestureResponderEvent, initialDate?: Date) {
        eventCreatorInitialDate.current = initialDate || undefined;

        setEventCreatorModalVisible(true);
    }

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(data: Date[] | null | undefined, index: number) {
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
    }

    function onEndReached() {
        visibleDaysDispatch({
            type: 'add-to-bottom',
            numNewDays: 7,
            removeFromTop: true,
        })
    }

    function onEventCreatorSubmitted(newEvent: EventDetails) {
        setEventCreatorModalVisible(false);

        eventDataDispatch({
            type: 'add',
            newEvent: newEvent,
        });
    }

    function onTestButtonPressed() {
        console.log('eventData:');

        for (let i = 0; i < eventData.length; i++) {
            const dateString = `${eventData[i].date.getMonth() + 1}/${eventData[i].date.getDate()}`;
            
            let eventArrayString = '[';
            for (let j = 0; j < eventData[i].events.length; j++) {
                if (j > 0) eventArrayString += ', ';
                const event = eventData[i].events[j];
                eventArrayString += event.name;
            }
            eventArrayString += ']';

            console.log(`${dateString}: ${eventArrayString}`);
        }
    }

    function renderDayRow({ item }: {item: Date}) {
        const events = getRowEventsFromDate(eventData, item)?.events || [];

        return <DayRow date={item} events={events} onPress={(gesture, rowDate) => openEventCreator(gesture, rowDate)} />;
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={'#fff'} barStyle={"dark-content"} />
            <CallbackContext.Provider value={{ onTileDragStart: onTileDragStart, onTileDropped: onTileDropped, onTilePressed: onTilePressed }}>
                <InfiniteScrollFlatList
                    ref={flatListRef}
                    data={visibleDays}
                    keyExtractor={item => item.getTime().toString()}
                    renderItem={renderDayRow}
                    ItemSeparatorComponent={DayRowSeparater}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={visibleDays.findIndex(item => datesMatch(item, today()))}
                    scrollEnabled={scrollEnabled}
                    onScroll={event => scrollYOffset.current = event.nativeEvent.contentOffset.y}
                    onStartReached={onStartReached}
                    onEndReached={onEndReached}
                    //showsVerticalScrollIndicator={false}
                />
            </CallbackContext.Provider>
            <Modal
                animationType="slide"
                visible={eventCreatorModalVisible}
                onRequestClose={() => setEventCreatorModalVisible(false)}
                presentationStyle="pageSheet"
            >
                <EventCreator initialDate={eventCreatorInitialDate.current} onEventCreated={onEventCreatorSubmitted} />
            </Modal>
            <TestButton onPress={onTestButtonPressed}/>
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