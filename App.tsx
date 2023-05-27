import React, { useRef, useState, useReducer, useEffect } from "react";
import {
    StyleSheet,
    View,
    Modal,
    FlatList,
    PanResponderGestureState,
    GestureResponderEvent,
    StatusBar,
} from "react-native";
import DateYMD from "./src/DateMDY";
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
    const [eventCreatorModalVisible, setEventCreatorModalVisible] = useState(false);
    
    const visibleDays_closureSafeRef = useRef(visibleDays);
    const scrollYOffset = useRef(0);
    const eventCreatorInitialDate = useRef<DateYMD>();
    const flatListRef = useRef<FlatList<any> | null>(null);
    

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

    function onTilePressed(gesture: GestureResponderEvent, event: EventDetails) {
        console.log('removing', event.name);
        eventDataDispatch({ type: 'remove', eventID: event.id });
    }

    function openEventCreator(gesture: GestureResponderEvent, initialDate?: DateYMD) {
        eventCreatorInitialDate.current = initialDate;

        setEventCreatorModalVisible(true);
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
        setEventCreatorModalVisible(false);

        eventDataDispatch({
            type: 'add',
            newEvent: newEvent,
        });
    }

    function onTestButtonPressed() {
        /*console.log('visible days:');
        const days = visibleDays_closureSafeRef.current;
        for (let i = 0; i < days.length; i++) {
            console.log(days[i].toString());
        }*/

        console.log(DateYMD.today())
    }

    function renderDayRow({ item }: { item: DateYMD }) {
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
                    keyExtractor={item => item.toString()}
                    renderItem={renderDayRow}
                    ItemSeparatorComponent={DayRowSeparater}
                    getItemLayout={getItemLayout}
                    initialScrollIndex={visibleDays.findIndex(item => item.isToday())}
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