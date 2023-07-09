import React, { useRef, useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    GestureResponderEvent,
    StatusBar,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
    useWindowDimensions,
    Platform,
    Appearance,
} from "react-native";
import VisualSettings from "../src/VisualSettings";
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
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
import { useAppSelector, useAppDispatch } from "../src/redux/hooks";
import { deleteEvent } from "../src/EventHelpers";
import Icon from 'react-native-vector-icons/MaterialIcons';
import VETContainer, { VirtualEventTileRef } from "../components/VETContainer";
import { eventActions } from "../src/redux/features/events/eventsSlice";
import { getEventPlan, rowPlansActions } from "../src/redux/features/rowPlans/rowPlansSlice";
import { visibleDaysActions } from "../src/redux/features/visibleDays/visibleDaysSlice";
import { colors } from "../src/GlobalStyles";
import { generalStateActions } from "../src/redux/features/general/generalSlice";
import { EventTileCallbacks, Vector2D } from "../types/General";
import ContextMenu, { ContextMenuRef } from "../components/ContextMenu";
import { ContextMenuDetails, ContextMenuPosition } from "../types/ContextMenu";

export default function MainScreen() {
    const { height } = useWindowDimensions();

    const dispatch = useAppDispatch();

    const visibleDays = useAppSelector(state => state.visibleDays);
    const visibleDays_closureSafeRef = useRef(visibleDays);
    visibleDays_closureSafeRef.current = visibleDays;

    const rowPlans = useAppSelector(state => state.rowPlans);
    const rowPlans_closureSafeRef = useRef(rowPlans);
    rowPlans_closureSafeRef.current = rowPlans;

    const [eventCreatorVisible, setEventCreatorVisible] = useState(false);
    const [eventEditorVisible, setEventEditorVisible] = useState(false);

    const scrollYOffset = useRef(0);
    const eventCreator_initialDate = useRef<DateYMD>();
    const eventEditor_editedEventID = useRef('');
    const virtualEventTileRef = useRef<VirtualEventTileRef | null>(null);
    const flatListRef = useRef<FlatList<any> | null>(null);
    const contextMenuRef = useRef<ContextMenuRef | null>(null);

    // Refs related to autoscroll while dragging event
    const currentDraggedEvent = useRef<string | null>(null);
    const lastFrameTime = useRef<Date>();
    const lastDragPosition = useRef<Vector2D>({x: 0, y: 0});
    const dragAutoScrollOffset = useRef(0);
    const scrollYOffsetAtDragStart = useRef(0);


    function onTilePressed_cb(gesture: GestureResponderEvent, eventID: string) {
        dispatch(eventActions.toggleComplete({eventID}));
    }

    function onTileLongPressed_cb(gesture: GestureResponderEvent, eventID: string) {
        openEventTileContextMenu(eventID);
    }

    function onTileDragStart_cb(gesture: GestureResponderEvent, eventID: string) {
        contextMenuRef.current?.close();

        // auto scroll setup
        scrollYOffsetAtDragStart.current = scrollYOffset.current;
        dragAutoScrollOffset.current = 0;
        currentDraggedEvent.current = eventID;
        lastFrameTime.current = new Date();
        lastDragPosition.current = {x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY};
        requestAnimationFrame(dragLoop);

        // show virtual event tile and initialize its position
        virtualEventTileRef.current?.enable(gesture, eventID);

        // update dragged event state so that the event will be hidden while dragging
        dispatch(generalStateActions.setDraggedEvent({eventID}));
    }

    function onTileDrag_cb(gesture: GestureResponderEvent) {
        lastDragPosition.current = { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY };
    }

    function onTileDropped_cb() {
        currentDraggedEvent.current = null;

        // make the dropped event tile visible again by clearing the dragged event state
        dispatch(generalStateActions.clearDraggedEvent());
    }

    function dragLoop() {
        // Loop while an event is being dragged
        if (currentDraggedEvent.current) requestAnimationFrame(dragLoop);
        else return;

        if (!lastFrameTime.current) {
            console.error('MainScreen -> dragLoop: lastFrameTime.current is undefined')
            return;
        }
        
        // Auto scroll
        const currentTime = new Date();
        const delta = currentTime.valueOf() - lastFrameTime.current.valueOf();
        lastFrameTime.current = currentTime;

        const scrollAmount = delta / 2;

        if (lastDragPosition.current.y < height * 0.1) {
            dragAutoScrollOffset.current -= scrollAmount;
            const scrollPosition = scrollYOffsetAtDragStart.current + dragAutoScrollOffset.current;
            flatListRef.current?.scrollToOffset({ animated: false, offset: scrollPosition });
        }
        else if (lastDragPosition.current.y > height - (height * 0.1)) {
            dragAutoScrollOffset.current += scrollAmount;
            const scrollPosition = scrollYOffsetAtDragStart.current + dragAutoScrollOffset.current;
            flatListRef.current?.scrollToOffset({ animated: false, offset: scrollPosition });
        }

        // update event plan
        updateEventWhileDragging();
    }

    function updateEventWhileDragging() {
        if (!currentDraggedEvent.current) return;

        let eventPlanChanged = false;
        const visibleDays_CSR = visibleDays_closureSafeRef.current;
        const rowPlans_CSR = rowPlans_closureSafeRef.current;

        const currentEventPlans = getEventPlan(rowPlans_CSR, currentDraggedEvent.current);
        if (!currentEventPlans) {
            console.warn('MainScreen -> dragLoop: Could not get event plan');
            return;
        }

        const overlappingRowDate = getDayRowAtScreenPosition(visibleDays_CSR, rowPlans_CSR, scrollYOffset.current, lastDragPosition.current);
        if (!overlappingRowDate) {
            console.error('MainScreen -> onTileDropped_cb: Could not find row overlapping drop position');
            return;
        }

        const samePlannedDate = DateYMDHelpers.datesEqual(currentEventPlans.plannedDate, overlappingRowDate);
        if (!samePlannedDate) {
            eventPlanChanged = true;
        }

        const targetVisibleDaysIndex = visibleDays_CSR.findIndex(item => DateYMDHelpers.datesEqual(item, overlappingRowDate));
        if (targetVisibleDaysIndex == -1) {
            console.error('onTileDropped: Could not find visible day with date matching', DateYMDHelpers.toString(overlappingRowDate));
            return;
        }

        let insertionIndex = getInsertionIndexFromGesture(visibleDays_CSR, rowPlans_CSR, scrollYOffset.current, targetVisibleDaysIndex, lastDragPosition.current);

        const numEventsInRow = rowPlans_CSR[currentEventPlans.rowPlansIndex].orderedEventIDs.length;

        /**
         * If a tile is dragged to the end of a row, the insertion index will
         * equal the index for the next element to be added. However, if the tile
         * is already in the row, this could cause a lot of unnecesary rerenders,
         * so whenever that's the case, decrement it back down to rowPlans.length - 1.
         */ 
        if (samePlannedDate && insertionIndex > numEventsInRow-1) insertionIndex--;
        
        if (insertionIndex !== currentEventPlans.rowOrder) {

            eventPlanChanged = true;
        }

        if (eventPlanChanged) {
            dispatch(rowPlansActions.changePlannedDate({ eventID: currentDraggedEvent.current, plannedDate: overlappingRowDate, insertionIndex }));
        }
    }

    function openEventTileContextMenu(eventID: string) {
        const contextMenuPosition = getContextMenuPositionForEventTile(eventID);
        if (!contextMenuPosition) {
            console.error(`MainScreen -> openEventTileContextMenu: Could not get context menu position`);
            return;
        }

        const contextMenuDetails: ContextMenuDetails = {
            options: [
                {
                    name: 'Edit',
                    onPress: () => openEventEditor(eventID),
                    iconName: 'edit',
                    color: colors.text,
                },
                {
                    name: 'Delete',
                    onPress: () => {
                        deleteEvent(dispatch, eventID);
                    },
                    iconName: 'delete',
                    color: '#d00',
                },
            ],
            position: contextMenuPosition,
        }

        contextMenuRef.current?.create(contextMenuDetails);
    }

    function getContextMenuPositionForEventTile(eventID: string) {
        const visibleDays_CSR = visibleDays_closureSafeRef.current;
        const rowPlans_CSR = rowPlans_closureSafeRef.current;

        const eventPlan = getEventPlan(rowPlans_CSR, eventID);
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
        onTileDragStart: onTileDragStart_cb,
    }

    function renderItem({ item }: { item: DateYMD }) {
        return <DayRow
            date={item}
            onPress={(gesture, rowDate) => openEventCreator(rowDate)}
            eventTileCallbacks={eventTileCallbacks}
        />;
    };

    function DayRowSeparater() {
        return <View style={styles.dayRowSeparater} />;
    }

    function getItemLayout(data: ArrayLike<DateYMD> | null | undefined, index: number) {
        return ({
            length: getDayRowHeight(rowPlans, visibleDays[index]),
            offset: getDayRowYOffset(visibleDays, rowPlans, index),
            index
        });
    }

    function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        scrollYOffset.current = event.nativeEvent.contentOffset.y;
    }

    const NUM_NEW_DAYS = 14;
    function onStartReached() {
        dispatch(visibleDaysActions.addDaysToTop({ numNewDays: NUM_NEW_DAYS }));

        // If autoscrolling while dragging a tile, apply offset to dragAutoScrollOffset
        if (currentDraggedEvent.current) {
            const addedDays = DateYMDHelpers.createSequentialDateArray(DateYMDHelpers.subtractDays(visibleDays[0], NUM_NEW_DAYS), NUM_NEW_DAYS);
            const heightOfNewRows = getDayRowYOffset(addedDays, rowPlans, NUM_NEW_DAYS);
            dragAutoScrollOffset.current += heightOfNewRows;
        }
    }

    function onEndReached() {
        dispatch(visibleDaysActions.addDaysToBottom({ numNewDays: NUM_NEW_DAYS }));
    }

    function openEventCreator(initialDate?: DateYMD) {
        eventCreator_initialDate.current = initialDate;
        setEventCreatorVisible(true);
    }

    function openEventEditor(eventID: string) {
        eventEditor_editedEventID.current = eventID;
        setEventEditorVisible(true);
    }

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor={Appearance.getColorScheme() === 'light' ? '#fff8' : '#0008'}
                barStyle={Appearance.getColorScheme() === 'light' ? 'dark-content' : 'light-content'}
                translucent
            />
            <VETContainer ref={virtualEventTileRef} onDrag={onTileDrag_cb} onDrop={onTileDropped_cb}>
                <ContextMenu ref={contextMenuRef}>
                    <FlatList
                        ref={flatListRef}
                        data={visibleDays}
                        keyExtractor={item => DateYMDHelpers.toString(item)}
                        renderItem={renderItem}
                        ItemSeparatorComponent={DayRowSeparater}
                        getItemLayout={getItemLayout}
                        initialScrollIndex={visibleDays.findIndex(item => DateYMDHelpers.isToday(item)) - 1}
                        //scrollEnabled <- Instead of using a state here, I'm using flatListRef.setNativeProps({ scrollEnabled: true/false }). This way changing it doesn't cause a rerender.
                        onScroll={onScroll}
                        onStartReached={onStartReached}
                        onStartReachedThreshold={1}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={1}
                        maintainVisibleContentPosition={{ minIndexForVisible: 2 }}
                        showsVerticalScrollIndicator={false}
                    />
                </ContextMenu>
            </VETContainer>
            <TouchableOpacity style={styles.addButton} onPress={() => openEventCreator()}>
                <Icon name="add" color={'white'} size={40} />
            </TouchableOpacity>
            <EventCreator
                visible={eventCreatorVisible}
                onRequestClose={() => setEventCreatorVisible(false)}
                initialDueDate={eventCreator_initialDate.current}
            />
            <EventEditor
                visible={eventEditorVisible}
                onRequestClose={() => setEventEditorVisible(false)}
                editedEventID={eventEditor_editedEventID.current}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.l0,
        flex: 1
    },
    addButton: {
        position: 'absolute',
        width: 70,
        height: 70,
        right: 15,
        bottom: 15,
        borderRadius: 100,
        backgroundColor: '#01C000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayRowSeparater: {
        height: VisualSettings.App.dayRowSeparater.height,
    }
});