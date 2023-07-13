import React, { useRef, useState, useCallback } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    GestureResponderEvent,
    StatusBar,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
    useWindowDimensions,
    Appearance,
    ViewToken,
} from "react-native";
import VisualSettings from "../src/VisualSettings";
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
import {
    getDayRowHeight,
    getDayRowYOffset,
    getEventTileDimensions,
    getDayRowScreenYOffset,
} from "../src/VisibleDaysHelpers";
import DayRow from "../components/DayRow";
import EventCreator, { EventCreatorRef } from "../components/EventCreator";
import EventEditor, { EventEditorRef } from "../components/EventEditor";
import { useAppSelector, useAppDispatch } from "../src/redux/hooks";
import { deleteEvent } from "../src/EventHelpers";
import Icon from 'react-native-vector-icons/MaterialIcons';
import VETContainer, { VirtualEventTileRef } from "../components/VETContainer";
import { eventActions } from "../src/redux/features/events/eventsSlice";
import { getEventPlan } from "../src/redux/features/rowPlans/rowPlansSlice";
import { visibleDaysActions } from "../src/redux/features/visibleDays/visibleDaysSlice";
import { colors, fontSizes } from "../src/GlobalStyles";
import { generalStateActions } from "../src/redux/features/general/generalSlice";
import { EventTileCallbacks, Vector2D } from "../types/General";
import ContextMenu, { ContextMenuRef } from "../components/ContextMenu";
import { ContextMenuDetails, ContextMenuPosition } from "../types/ContextMenu";
import { updateEventPlanFromDragPosition } from "../src/RowPlansHelpers";

type TodayRowVisibility = 'visible' | 'beneath' | 'above';

export default function MainScreen() {
    const { height } = useWindowDimensions();

    const dispatch = useAppDispatch();

    const visibleDays = useAppSelector(state => state.visibleDays);
    const visibleDays_closureSafeRef = useRef(visibleDays);
    visibleDays_closureSafeRef.current = visibleDays;

    const rowPlans = useAppSelector(state => state.rowPlans);
    const rowPlans_closureSafeRef = useRef(rowPlans);
    rowPlans_closureSafeRef.current = rowPlans;

    const multiselectState = useAppSelector(state => state.general.multiselect);

    const [todayRowVisibility, setTodayRowVisibility] = useState<TodayRowVisibility>('visible');

    const scrollYOffset = useRef(0);
    const eventCreatorRef = useRef<EventCreatorRef | null>(null);
    const eventEditorRef = useRef<EventEditorRef | null>(null);
    const virtualEventTileRef = useRef<VirtualEventTileRef | null>(null);
    const flatListRef = useRef<FlatList<any> | null>(null);
    const contextMenuRef = useRef<ContextMenuRef | null>(null);

    // Refs related to autoscroll while dragging event
    const currentDraggedEvent = useRef<string | null>(null);
    const lastFrameTime = useRef<Date>();
    const lastDragPosition = useRef<Vector2D>({x: 0, y: 0});
    const dragAutoScrollOffset = useRef(0);
    const scrollYOffsetAtDragStart = useRef(0);
    

    function onTileLongPressed_cb(gesture: GestureResponderEvent, eventID: string) {
        if (!multiselectState.enabled) openEventTileContextMenu(eventID); // Disable context menu during multiselect
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

        setDraggedTileVisuals(eventID);
    }

    function onTileDrag_cb(gesture: GestureResponderEvent) {
        lastDragPosition.current = { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY };
    }

    function onTileDropped_cb() {
        currentDraggedEvent.current = null;

        restoreDraggedTileVisuals();
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
        
        updateEventPlanFromDragPosition(
            dispatch,
            visibleDays_closureSafeRef.current,
            rowPlans_closureSafeRef.current,
            scrollYOffset.current,
            currentDraggedEvent.current,
            lastDragPosition.current
        );
    }

    function setDraggedTileVisuals(draggedEventID: string) {
        dispatch(generalStateActions.setDraggedEvent({ eventID: draggedEventID }));
    }
    
    function restoreDraggedTileVisuals() {
        dispatch(generalStateActions.clearDraggedEvent());
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
                    onPress: () => eventEditorRef.current?.open(eventID),
                    iconName: 'edit',
                    color: colors.text,
                },
                {
                    name: 'Select',
                    onPress: () => {
                        dispatch(generalStateActions.setMultiselectEnabled({enabled: true}));
                        dispatch(generalStateActions.toggleEventIDSelected({eventID}));
                    },
                    iconName: 'check-box',
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
        onTileLongPressed: onTileLongPressed_cb,
        onTileDragStart: onTileDragStart_cb,
    }

    function renderItem({ item }: { item: DateYMD }) {
        return <DayRow
            date={item}
            onPress={(gesture, rowDate) => eventCreatorRef.current?.open(rowDate)}
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

    const onViewableItemsChanged = useCallback(
        ({ viewableItems, changed }: { viewableItems: ViewToken[], changed: ViewToken[] }) => {
            const keyForTodayRow = DateYMDHelpers.toString(DateYMDHelpers.today());
            const todaysRow = changed.find(item => item.key === keyForTodayRow);
            const todayVisibilityChanged = todaysRow !== undefined;

            if (todayVisibilityChanged) {
                if (todaysRow.isViewable) {
                    setTodayRowVisibility('visible');
                }
                else {
                    if (!viewableItems[0]) return;
                    const firstViewableItem = viewableItems[0].index || -1;
                    const todaysIndex = todaysRow.index || -1;

                    if (firstViewableItem === todaysIndex) return; // This is a case that often occurs. Ignoring it doesn't seem to cause issues.

                    const todaysRowIsAbove = firstViewableItem > todaysIndex;
                    if (todaysRowIsAbove) {
                        setTodayRowVisibility('above');
                    }
                    else {
                        setTodayRowVisibility('beneath');
                    }
                }
            }
        },
        []
    );

    const NUM_NEW_DAYS = 14;
    function onStartReached() {
        dispatch(visibleDaysActions.addDaysToTop({ numNewDays: NUM_NEW_DAYS }));

        // If autoscrolling while dragging a tile, apply offset to dragAutoScrollOffset
        if (currentDraggedEvent.current) {
            shiftDragScrollDeltaYByHeightOfAddedRows(NUM_NEW_DAYS, visibleDays[0]);
        }
    }

    function onEndReached() {
        dispatch(visibleDaysActions.addDaysToBottom({ numNewDays: NUM_NEW_DAYS }));
    }

    function shiftDragScrollDeltaYByHeightOfAddedRows(numAddedRows: number, dateOfFirstNewRow: DateYMD) {
        const addedDays = DateYMDHelpers.createSequentialDateArray(DateYMDHelpers.subtractDays(dateOfFirstNewRow, numAddedRows), numAddedRows);
        const heightOfNewRows = getDayRowYOffset(addedDays, rowPlans, numAddedRows);
        dragAutoScrollOffset.current += heightOfNewRows;
    }

    function returnToTodayButton(variation: 'above' | 'beneath') {
        return (
            <TouchableOpacity style={[styles.returnToTodayButton, variation === 'above' ? { position: 'absolute', top: 20 } : { marginBottom: 20 }]} onPress={scrollToToday}>
                <Text style={styles.returnToTodayText}>Today</Text>
                <Icon name={variation === 'above' ? "arrow-upward" : "arrow-downward"} size={20} style={styles.returnToTodayIcon} />
            </TouchableOpacity>
        );
    }

    function addEventButton() {
        return (
            <TouchableOpacity style={styles.addButton} onPress={() => eventCreatorRef.current?.open()}>
                <Icon name="add" color={'white'} size={40} />
            </TouchableOpacity>
        );
    }

    function multiselectButtons() {
        return (
            <View style={styles.multiselectOptionsContainer}>
                <TouchableOpacity style={styles.multiselectOption} onPress={() => {}}>
                    <Text></Text>
                    <Icon name="delete" color={'red'} size={30} />
                </TouchableOpacity>
            </View>
        );
    }

    function scrollToToday() {
        const todayIndex = visibleDays_closureSafeRef.current.findIndex(item => DateYMDHelpers.isToday(item));
        
        flatListRef.current?.scrollToIndex({
            animated: true,
            index: todayIndex,
        })
    }

    return (
        <View style={styles.container}>
            {/*<StatusBar
                backgroundColor={Appearance.getColorScheme() === 'light' ? '#fff8' : '#0008'}
                barStyle={Appearance.getColorScheme() === 'light' ? 'dark-content' : 'light-content'}
                translucent
            />*/}
            <VETContainer ref={virtualEventTileRef} onDrag={onTileDrag_cb} onDrop={onTileDropped_cb}>
                <ContextMenu ref={contextMenuRef}>
                    <FlatList
                        ref={flatListRef}
                        data={visibleDays}
                        keyExtractor={item => DateYMDHelpers.toString(item)}
                        renderItem={renderItem}
                        ItemSeparatorComponent={DayRowSeparater}
                        getItemLayout={getItemLayout}
                        initialScrollIndex={visibleDays.findIndex(item => DateYMDHelpers.isToday(item))}
                        //scrollEnabled <- Instead of using a state here, I'm using flatListRef.setNativeProps({ scrollEnabled: true/false }). This way changing it doesn't cause a rerender.
                        onScroll={onScroll}
                        onViewableItemsChanged={onViewableItemsChanged}
                        onStartReached={onStartReached}
                        onStartReachedThreshold={1}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={1}
                        maintainVisibleContentPosition={{ minIndexForVisible: 2 }}
                        showsVerticalScrollIndicator={false}
                    />
                </ContextMenu>
            </VETContainer>
            {todayRowVisibility === 'above' ? returnToTodayButton('above') : null}
            <View style={styles.overlayFooterContainer}>
                {multiselectState.enabled ? multiselectButtons() : null}
                {todayRowVisibility === 'beneath' ? returnToTodayButton('beneath') : null}
            </View>
            {!multiselectState.enabled ? addEventButton() : null}
            <EventCreator ref={eventCreatorRef} />
            <EventEditor ref={eventEditorRef} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.l0,
        flex: 1
    },
    returnToTodayButton: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 10,
        backgroundColor: colors.todayL2,
    },
    returnToTodayText: {
        color: colors.text,
        fontSize: fontSizes.p,
    },
    returnToTodayIcon: {
        color: colors.text,
        marginLeft: 5,
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
    overlayFooterContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    multiselectOptionsContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginBottom: 20,
    },
    multiselectOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#888',
        padding: 15,
        borderRadius: 40,
    },
    dayRowSeparater: {
        height: VisualSettings.App.dayRowSeparater.height,
    }
});