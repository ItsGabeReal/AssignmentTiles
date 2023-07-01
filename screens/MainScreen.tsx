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
import ContextMenuContainer, { ContextMenuContainerRef } from "../components/ContextMenuContainer";
import { ContextMenuDetails, ContextMenuPosition } from "../components/ContextMenu";
import { useAppSelector, useAppDispatch } from "../src/redux/hooks";
import { deleteEvent } from "../src/EventHelpers";
import Icon from 'react-native-vector-icons/MaterialIcons';
import VirtualEventTile, { VirtualEventTileRef } from "../components/VirtualEventTile";
import { eventActions } from "../src/redux/features/events/eventsSlice";
import { getEventPlan, rowPlansActions } from "../src/redux/features/rowPlans/rowPlansSlice";
import { visibleDaysActions } from "../src/redux/features/visibleDays/visibleDaysSlice";
import { colors } from "../src/GlobalStyles";
import { EventTileCallbacks } from "../types/EventTile";

export default function MainScreen() {
    const {height, width} = useWindowDimensions();

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
    const contextMenuRef = useRef<ContextMenuContainerRef | null>(null);

    // Refs related to autoscroll while dragging event
    const draggingEventTile = useRef(false);
    const lastFrameTime = useRef<Date>();
    const lastDragPageY = useRef(0);
    const dragAutoScrollOffset = useRef(0);
    const scrollYOffsetAtDragStart = useRef(0);


    function onTilePressed_cb(gesture: GestureResponderEvent, eventID: string) {
        dispatch(eventActions.toggleComplete({eventID}));
    }

    function onTileLongPressed_cb(gesture: GestureResponderEvent, eventID: string) {
        flatListRef.current?.setNativeProps({ scrollEnabled: false });
        openEventTileContextMenu(eventID);
    }

    function onTileLongPressRelease_cb() {
        flatListRef.current?.setNativeProps({ scrollEnabled: true });
    }

    function onTileDragStart_cb(gesture: GestureResponderEvent, eventID: string) {
        contextMenuRef.current?.close();

        // auto scroll setup
        /**
         * There's a bug on ios where calling scrolTo will terminate
         * the dragged tile's panresponder, so for now, auto scrolling
         * is disabled on ios.
         */
        if (Platform.OS !== 'ios') {
            scrollYOffsetAtDragStart.current = scrollYOffset.current;
            dragAutoScrollOffset.current = 0;
            draggingEventTile.current = true;
            lastFrameTime.current = new Date();
            lastDragPageY.current = gesture.nativeEvent.pageY;
            requestAnimationFrame(dragLoop);
        }

        // show virtual event tile and initialize its position
        virtualEventTileRef.current?.show(eventID)
        virtualEventTileRef.current?.setDragPosition(gesture.nativeEvent.pageX, gesture.nativeEvent.pageY);
    }

    function onTileDrag_cb(gesture: GestureResponderEvent) {
        lastDragPageY.current = gesture.nativeEvent.pageY;

        virtualEventTileRef.current?.setDragPosition(gesture.nativeEvent.pageX, gesture.nativeEvent.pageY);
    }

    function onTileDropped_cb(gesture: GestureResponderEvent, eventID: string) {
        draggingEventTile.current = false;
        virtualEventTileRef.current?.hide();

        const visibleDays_CSR = visibleDays_closureSafeRef.current;
        const rowPlans_CSR = rowPlans_closureSafeRef.current;

        const overlappingRowDate = getDayRowAtScreenPosition(visibleDays_CSR, rowPlans_CSR, scrollYOffset.current, { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY });
        if (!overlappingRowDate) {
            console.error('MainScreen -> onTileDropped_cb: Could not find row overlapping drop position');
            return;
        }

        const targetVisibleDaysIndex = visibleDays_CSR.findIndex(item => DateYMDHelpers.datesEqual(item, overlappingRowDate));
        if (targetVisibleDaysIndex == -1) {
            console.error('onTileDropped: Could not find visible day with date matching', DateYMDHelpers.toString(overlappingRowDate));
            return;
        }

        const insertionIndex = getInsertionIndexFromGesture(visibleDays_CSR, rowPlans_CSR, scrollYOffset.current, targetVisibleDaysIndex, gesture);

        dispatch(rowPlansActions.changePlannedDate({eventID, plannedDate: overlappingRowDate, insertionIndex}));
    }

    function dragLoop() {
        if (!draggingEventTile.current) return;

        if (!lastFrameTime.current) {
            console.error('MainScreen -> dragLoop: lastFrameTime.current is undefined')
            return;
        }
        
        const currentTime = new Date();
        const delta = currentTime.valueOf() - lastFrameTime.current.valueOf();
        lastFrameTime.current = currentTime;
        
        const scrollAmount = delta / 2;

        if (lastDragPageY.current < height * 0.1) {
            dragAutoScrollOffset.current -= scrollAmount;
            const scrollPosition = scrollYOffsetAtDragStart.current + dragAutoScrollOffset.current;
            flatListRef.current?.scrollToOffset({ animated: false, offset: scrollPosition });
        }
        else if (lastDragPageY.current > height - (height * 0.1)) {
            dragAutoScrollOffset.current += scrollAmount;
            const scrollPosition = scrollYOffsetAtDragStart.current + dragAutoScrollOffset.current;
            flatListRef.current?.scrollToOffset({ animated: false, offset: scrollPosition });
        }

        requestAnimationFrame(dragLoop);
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
        onTileLongPressRelease: onTileLongPressRelease_cb,
        onTileDragStart: onTileDragStart_cb,
        onTileDrag: onTileDrag_cb,
        onTileDropped: onTileDropped_cb,
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

    function onStartReached() {
        dispatch(visibleDaysActions.addDaysToTop({numNewDays: 7}));
    }

    function onEndReached() {
        dispatch(visibleDaysActions.addDaysToBottom({numNewDays: 7}));
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
                maintainVisibleContentPosition={{minIndexForVisible: 2}}
                showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => openEventCreator()}>
                <Icon name="add" color={'white'} size={40} />
            </TouchableOpacity>
            <ContextMenuContainer ref={contextMenuRef} />
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
            <VirtualEventTile ref={virtualEventTileRef} />
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