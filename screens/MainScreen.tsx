import React, { useRef, useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    useWindowDimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    BackHandler,
    ColorValue,
    GestureResponderEvent,
} from "react-native";
import VETContainer, { VirtualEventTileRef } from "../components/VETContainer";
import EventInput,  { EventInputRef, OnEventInputSubmitParams } from "../components/EventInput";
import DayList, { TodayRowVisibility } from "../components/DayList";
import VisualSettings from "../src/VisualSettings";
import { DateYMDHelpers } from "../src/DateYMD";
import { useAppSelector, useAppDispatch } from "../src/redux/hooks";
import { createEvent, deleteMultipleEventsAndBackup, restoreDeletedEventsFromBackup } from "../src/EventHelpers";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, fontSizes } from "../src/GlobalStyles";
import { generalStateActions } from "../src/redux/features/general/generalSlice";
import { Vector2D } from "../types/General";
import { updateEventPlanFromDragPosition } from "../src/RowPlansHelpers";
import { EventRegister } from "react-native-event-listeners";
import { eventActions } from "../src/redux/features/events/eventsSlice";
import SafeAreaView from "../components/core/SafeAreaView";
import { vibrate } from "../src/GlobalHelpers";
import Button from "../components/Button";
import { green, hexToRGBA, red, white } from "../src/ColorHelpers";
import FloatingCategoryPicker, { FloatingCategoryPickerRef } from "../components/FloatingCategoryPicker";

export default function MainScreen() {
    const { height } = useWindowDimensions();

    const dispatch = useAppDispatch();

    // Used for testing
    //const entireState = useAppSelector(state => state);

    const visibleDays = useAppSelector(state => state.visibleDays);
    const visibleDays_closureSafeRef = useRef(visibleDays);
    visibleDays_closureSafeRef.current = visibleDays;

    const rowPlans = useAppSelector(state => state.rowPlans.current);
    const rowPlans_closureSafeRef = useRef(rowPlans);
    rowPlans_closureSafeRef.current = rowPlans;

    const multiselectState = useAppSelector(state => state.general.multiselect);
    const multiselectState_closureSafeRef = useRef(multiselectState);
    multiselectState_closureSafeRef.current = multiselectState;

    const [todayRowVisibility, setTodayRowVisibility] = useState<TodayRowVisibility>('visible');

    const scrollYOffset = useRef(0);
    const eventInputRef = useRef<EventInputRef | null>(null);
    const virtualEventTileRef = useRef<VirtualEventTileRef | null>(null);
    const flatListRef = useRef<FlatList<any> | null>(null);
    const multiselectCategoryPickerRef = useRef<FloatingCategoryPickerRef | null>(null);

    // Refs related to autoscroll while dragging event
    const currentDraggedEvent = useRef<string | null>(null);
    const lastFrameTime = useRef<Date>();
    const lastDragPosition = useRef<Vector2D>({x: 0, y: 0});
    const dragAutoScrollOffset = useRef(0);
    const scrollYOffsetAtDragStart = useRef(0);
    

    useEffect(() => {
        EventRegister.addEventListener('onEventTilePressed', onEventTilePressed)

        EventRegister.addEventListener('onEventTileLongPressed', onEventTileLongPressed);

        EventRegister.addEventListener('onEventTileDrag', onEventTileDrag);

        EventRegister.addEventListener('onEventTileDropped', onEventTileDropped);

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (multiselectState.enabled) {
                exitMultiselectMode();
                return true;
            }
            else return false; // Differ to the next back handler
        });

        // Cleanup function
        return () => {
            /**
             * removeAllListeners shaln't be used cause it causes other
             * issues, but not removing listeners might cause listeners
             * to double up, idk. I haven't tested it.
             */
            //EventRegister.removeAllListeners();
            backHandler.remove();
        }
    }, [multiselectState]);

    function onEventTilePressed({eventID}: any) {
        eventInputRef.current?.open({mode: 'edit', eventID});
    }

    /**
     * In order to resolve some bugs with dragging, it's extremely important
     * that we disable scrolling on the flatlist before beginning any drag
     * gestures. So on long press, we:
     *   1. Disable flatlist scrolling.
     *   2. Wait a frame for the changes to take effect.
     *   3. Enable dragging for the virtual event tile.
     */
    function onEventTileLongPressed({eventID, gesture}: any) {
        setFlatListScrollEnabled(false);

        requestAnimationFrame(() => {
            EventRegister.emit('onEventTileDragStart', { eventID, gesture });
            onEventTileDragStart(gesture, eventID);
        });
    }

    function onEventTileDragStart(gesture: GestureResponderEvent, eventID: string) {
        vibrate();

        // auto scroll setup
        scrollYOffsetAtDragStart.current = scrollYOffset.current;
        dragAutoScrollOffset.current = 0;
        currentDraggedEvent.current = eventID;
        lastFrameTime.current = new Date();
        lastDragPosition.current = { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY };
        requestAnimationFrame(dragLoop);

        // show virtual event tile and initialize its position
        virtualEventTileRef.current?.enable(gesture, eventID);

        setDraggedTileVisuals(eventID);

        // If an undo popup hasn't been manually closed yet, go ahead and close it
        EventRegister.emit('hideUndoPopup');
    }

    function onEventTileDrag({gesture}: any) {
        lastDragPosition.current = { x: gesture.nativeEvent.pageX, y: gesture.nativeEvent.pageY };
    }

    function onEventTileDropped() {
        currentDraggedEvent.current = null;

        restoreDraggedTileVisuals();

        setFlatListScrollEnabled(true);
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
    
    function returnToTodayButton(variation: 'above' | 'beneath') {
        return (
            <Button
                title="Today"
                titleSize={fontSizes.p}
                iconName={variation==='above' ? 'arrow-upward' : 'arrow-downward'}
                fontColor={colors.text_rgba}
                backgroundColor={colors.todayL2_rgba}
                iconSpacing={5}
                style={[styles.returnToTodayButton, variation === 'above' ? { position: 'absolute', top: 20 } : { marginBottom: 20 }]}
                onPress={scrollToToday}
            />
        );
    }

    function addEventButton() {
        return (
            <Button
                iconName="add"
                iconSize={40}
                backgroundColor={green}
                style={styles.addButton}
                onPress={() => {
                    eventInputRef.current?.open({ mode: 'create' });
                }}
            />
        );
    }

    function multiselectButtons() {
        const anyTilesSelected = multiselectState.selectedEventIDs.length > 0;

        return (
            <View style={styles.multiselectMainContainer}>
                <Button
                    title="Delete"
                    iconName="delete"
                    onPress={onMultiselectDeletePressed}
                    disabled={!anyTilesSelected}
                    backgroundColor={red}
                    style={styles.multiselectButton}
                />
                <Button
                    title="Set Category"
                    iconName="category"
                    onPress={() => multiselectCategoryPickerRef.current?.open()}
                    disabled={!anyTilesSelected}
                    style={styles.multiselectButton}
                />
                <Button
                    title="Cancel"
                    iconName="close"
                    onPress={exitMultiselectMode}
                    style={styles.multiselectButton}
                />
            </View>
        );
    }

    function exitMultiselectMode() {
        dispatch(generalStateActions.setMultiselectEnabled({ enabled: false }));
    }

    function onMultiselectDeletePressed() {
        deleteMultipleEventsAndBackup(dispatch, multiselectState.selectedEventIDs);
        exitMultiselectMode();

        const pluralModifier = multiselectState.selectedEventIDs.length === 1 ? '' : 's';
        const action = `${multiselectState.selectedEventIDs.length} Event${pluralModifier} Deleted`;

        EventRegister.emit('showUndoPopup', { action, onPressed: ()=>{restoreDeletedEventsFromBackup(dispatch)} });
    }

    function onMultiselectCategoryPicked(categoryID: string | null) {
        multiselectState.selectedEventIDs.forEach(item => {
            dispatch(eventActions.setCategoryID({eventID: item, categoryID}));
        });

        exitMultiselectMode();
    }

    function onEventSubmitted(params: OnEventInputSubmitParams) {
        if (params.mode === 'create') {
            createEvent(dispatch, params.details, params.plannedDate);
        }
        else {
            dispatch(eventActions.edit({
                eventID: params.editedEventID,
                newDetails: params.details
            }));
        }
    }

    function scrollToToday() {
        const todayIndex = visibleDays_closureSafeRef.current.findIndex(item => DateYMDHelpers.isToday(item));
        
        flatListRef.current?.scrollToIndex({
            animated: true,
            index: todayIndex,
        })
    }

    function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
        scrollYOffset.current = event.nativeEvent.contentOffset.y;
    }

    function setFlatListScrollEnabled(enabled: boolean) {
        flatListRef.current?.setNativeProps({ scrollEnabled: enabled });
    }

    function onStartReached(heightOfNewRows: number) {
        if (currentDraggedEvent.current) dragAutoScrollOffset.current += heightOfNewRows;
    }

    return (
        <View style={styles.container}>
            <VETContainer ref={virtualEventTileRef}>
                <DayList
                    ref={flatListRef}
                    onRequestOpenEventCreator={(suggestedDueDate) => eventInputRef.current?.open({ mode: 'create', suggestedDueDate })}
                    onTodayRowVisibilityChanged={setTodayRowVisibility}
                    onScroll={onScroll}
                    onStartReached={onStartReached}
                />
            </VETContainer>
            <SafeAreaView pointerEvents="box-none">
                {todayRowVisibility === 'above' ? returnToTodayButton('above') : null}
                {!multiselectState.enabled ? addEventButton() : null}
                <View style={styles.overlayFooterContainer}>
                    {multiselectState.enabled ? multiselectButtons() : null}
                    {todayRowVisibility === 'beneath' ? returnToTodayButton('beneath') : null}
                </View>
            </SafeAreaView>
            <EventInput ref={eventInputRef} onSubmit={onEventSubmitted} />
            <FloatingCategoryPicker
                ref={multiselectCategoryPickerRef}
                onCategorySelected={onMultiselectCategoryPicked}
            />
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
        right: 15,
        bottom: 15,
        padding: 15
    },
    overlayFooterContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    multiselectMainContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    multiselectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    multiselectText: {
        fontSize: fontSizes.h3,
        color: 'white',
        marginLeft: 10,
    },
    dayRowSeparater: {
        height: VisualSettings.App.dayRowSeparater.height,
    }
});