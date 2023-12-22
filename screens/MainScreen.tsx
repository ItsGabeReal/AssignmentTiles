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
} from "react-native";
import VisualSettings from "../src/VisualSettings";
import { DateYMDHelpers } from "../src/DateYMD";
import {
    getDayRowYOffset,
    getEventTileDimensions,
    getDayRowScreenYOffset,
} from "../src/VisibleDaysHelpers";
import EventCreator, { EventCreatorRef } from "../components/EventCreator";
import EventEditor, { EventEditorRef } from "../components/EventEditor";
import { useAppSelector, useAppDispatch } from "../src/redux/hooks";
import { deleteEventAndBackup, deleteMultipleEventsAndBackup, restoreDeletedEventsFromBackup } from "../src/EventHelpers";
import Icon from 'react-native-vector-icons/MaterialIcons';
import VETContainer, { VirtualEventTileRef } from "../components/VETContainer";
import { getEventPlan } from "../src/redux/features/rowPlans/rowPlansSlice";
import { colors, fontSizes } from "../src/GlobalStyles";
import { generalStateActions } from "../src/redux/features/general/generalSlice";
import { Vector2D } from "../types/General";
import ContextMenu, { ContextMenuRef } from "../components/ContextMenu";
import { ContextMenuDetails, ContextMenuPosition } from "../types/ContextMenu";
import { updateEventPlanFromDragPosition } from "../src/RowPlansHelpers";
import { EventRegister } from "react-native-event-listeners";
import DayList, { TodayRowVisibility } from "../components/DayList";
import CategoryPicker, { CategoryPickerRef } from "../components/CategoryPicker";
import { CategoryID } from "../types/store-current";
import { eventActions } from "../src/redux/features/events/eventsSlice";
import { restoreCategoryFromBackup } from "../src/CategoriesHelpers";
import UndoPopup, { UndoPopupRef } from "../components/UndoPopup";

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
    const eventCreatorRef = useRef<EventCreatorRef | null>(null);
    const eventEditorRef = useRef<EventEditorRef | null>(null);
    const virtualEventTileRef = useRef<VirtualEventTileRef | null>(null);
    const flatListRef = useRef<FlatList<any> | null>(null);
    const contextMenuRef = useRef<ContextMenuRef | null>(null);
    const multiselectCategoryPickerRef = useRef<CategoryPickerRef | null>(null);
    const undoPopupRef = useRef<UndoPopupRef | null>(null);

    // Refs related to autoscroll while dragging event
    const currentDraggedEvent = useRef<string | null>(null);
    const lastFrameTime = useRef<Date>();
    const lastDragPosition = useRef<Vector2D>({x: 0, y: 0});
    const dragAutoScrollOffset = useRef(0);
    const scrollYOffsetAtDragStart = useRef(0);
    

    useEffect(() => {
        EventRegister.addEventListener('showUndoPopup', onShowUndoPopup);

        EventRegister.addEventListener('onEventTileLongPressed', onEventTileLongPressed);

        EventRegister.addEventListener('onEventTileDragStart', onEventTileDragStart);

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

    function onShowUndoPopup({ prompt, onUndoPressed }: { prompt: string, onUndoPressed: (() => void)}) {
        undoPopupRef.current?.open(prompt, onUndoPressed);
    }

    function onEventTileLongPressed({eventID}: any) {
        setFlatListScrollEnabled(false);

        requestAnimationFrame(() => {
            EventRegister.emit('onFlatListScrollDisabled');
            
            if (!multiselectState_closureSafeRef.current.enabled) openEventTileContextMenu(eventID); // Disable context menu during multiselect
        });
    }

    function onEventTileDragStart({gesture, eventID}: any) {
        contextMenuRef.current?.close();

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
                        deleteEventAndBackup(dispatch, eventID);

                        undoPopupRef.current?.open('Event Deleted', () => {
                            restoreDeletedEventsFromBackup(dispatch);
                        });
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

    function returnToTodayButton(variation: 'above' | 'beneath') {
        return (
            <TouchableOpacity style={[styles.returnToTodayButton, variation === 'above' ? { position: 'absolute', top: 20 } : { marginBottom: 20 }]} onPress={scrollToToday}>
                <Text style={styles.returnToTodayText}>Today</Text>
                <Icon name={variation === 'above' ? "arrow-upward" : "arrow-downward"} size={20} style={styles.returnToTodayIcon} />
            </TouchableOpacity>
        );
    }

    const addButtonInTestMode = false;
    function addEventButton() {
        const onPress = () => {
            if (addButtonInTestMode) {
                console.warn('MainScreen -> addEventButton: Add button is in test mode');

                /*console.log('-----ENTIRE STATE-----')

                // print events
                console.log('events:')
                entireState.events.forEach(item => console.log(item.details.name));

                // print categories
                console.log('categories:')
                entireState.categories.forEach(item => console.log(item.name));

                // print row plans

                console.log('row plans:')
                entireState.rowPlans.forEach(item => {
                    console.log(`${DateYMDHelpers.toString(item.plannedDate)}:`);

                    item.orderedEventIDs.forEach(eventID => {
                        const event = entireState.events.find(evt => evt.id === eventID);

                        if (!event) console.log(`id ${eventID} is not in events`);
                        else console.log(event.details.name);
                    })
                })*/
            }
            else {
                eventCreatorRef.current?.open();
            }
        }

        return (
            <TouchableOpacity style={styles.addButton} onPress={onPress}>
                <Icon name="add" color={'white'} size={40} />
            </TouchableOpacity>
        );
    }

    function multiselectButtons() {
        const anyTilesSelected = multiselectState.selectedEventIDs.length > 0;

        return (
            <View style={styles.multiselectMainContainer}>
                {multiselectButton('Delete', 'delete', onMultiselectDeletePressed, !anyTilesSelected, '#d00')}
                {multiselectButton('Set Category', 'category', () => multiselectCategoryPickerRef.current?.open(), !anyTilesSelected)}
                {multiselectButton('Cancel', 'close', exitMultiselectMode)}
            </View>
        );
    }

    function exitMultiselectMode() {
        dispatch(generalStateActions.setMultiselectEnabled({ enabled: false }));
    }

    function multiselectButton(displayName: string, iconName: string, onPress: (() => void), disabled?: boolean, backgroundColor?: ColorValue) {

        return (
            <TouchableOpacity
                style={[styles.multiselectButton, { backgroundColor: backgroundColor || '#888', opacity: disabled ? 0.5 : 1 }]}
                onPress={onPress}
                disabled={disabled}
            >
                <Icon name={iconName} color={'white'} size={24} />
                <Text style={styles.multiselectText}>{displayName}</Text>
            </TouchableOpacity>
        )
    }

    function onMultiselectDeletePressed() {
        deleteMultipleEventsAndBackup(dispatch, multiselectState.selectedEventIDs);
        exitMultiselectMode();

        const pluralModifier = multiselectState.selectedEventIDs.length === 1 ? '' : 's';
        undoPopupRef.current?.open(`${multiselectState.selectedEventIDs.length} Event${pluralModifier} Deleted`, () => {
            restoreDeletedEventsFromBackup(dispatch);
        });
    }

    function onCategorySelectedDuringMultiselect(categoryID: CategoryID) {
        multiselectState.selectedEventIDs.forEach(item => {
            dispatch(eventActions.setCategoryID({eventID: item, categoryID}));
        });

        exitMultiselectMode();
    }

    function overlayButtons() {
        return (
            <>
                {todayRowVisibility === 'above' ? returnToTodayButton('above') : null}
                {!multiselectState.enabled ? addEventButton() : null}
                <View style={styles.overlayFooterContainer}>
                    {multiselectState.enabled ? multiselectButtons() : null}
                    {todayRowVisibility === 'beneath' ? returnToTodayButton('beneath') : null}
                    <UndoPopup ref={undoPopupRef} relativePosition />
                </View>
            </>
        );
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
                <ContextMenu ref={contextMenuRef} onPressOut={() => setFlatListScrollEnabled(true)} onOptionPressed={() => setFlatListScrollEnabled(true)}>
                    <DayList
                        ref={flatListRef}
                        onRequestOpenEventCreator={(suggestedDate) => eventCreatorRef.current?.open(suggestedDate)}
                        onTodayRowVisibilityChanged={setTodayRowVisibility}
                        onScroll={onScroll}
                        onStartReached={onStartReached}
                    />
                </ContextMenu>
            </VETContainer>
            {overlayButtons()}
            <EventCreator ref={eventCreatorRef} />
            <EventEditor ref={eventEditorRef} />
            <CategoryPicker ref={multiselectCategoryPickerRef} onSelect={onCategorySelectedDuringMultiselect} />
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
    multiselectMainContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    multiselectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 40,
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