import React, { useRef } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    GestureResponderEvent,
    Platform,
    Vibration,
    PanResponder,
} from 'react-native';
import DateYMD from '../src/DateYMD';
import EventTile from './EventTile';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import VisualSettings from '../src/VisualSettings';
import { generalStateActions } from '../src/redux/features/general/generalSlice';
import { eventActions } from '../src/redux/features/events/eventsSlice';
import { EventRegister } from 'react-native-event-listeners';

type InteractableEventTileProps = {
    /**
     * The if of the event this tile represents.
     */
    eventID: string;

    /**
     * The date on which this event is scheduled.
     */
    plannedDate: DateYMD;
}

const DRAG_START_DISTANCE = 5;

const InteractableEventTile: React.FC<InteractableEventTileProps> = (props) => {
    const dispatch = useAppDispatch();

    const isBeingDragged = useAppSelector(state => state.general.draggedEvent?.eventID ? (state.general.draggedEvent.eventID === props.eventID) : false);
    const multiselectEnabled = useAppSelector(state => state.general.multiselect.enabled);

    const listeningToMoveEvents = useRef(false);
    const calledDragStart = useRef(false);
    
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => listeningToMoveEvents.current,
            onPanResponderMove(e, gesture) {
                if (calledDragStart.current) return;

                const dragDistance = Math.sqrt(Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2));
                if (dragDistance > DRAG_START_DISTANCE) {
                    handleDragStart(e);
                    calledDragStart.current = true;
                }
            },
            onPanResponderRelease() {
                handleRelease();

            },
            onPanResponderTerminate() {
                handleRelease();
            },
            onPanResponderTerminationRequest(e, gestureState) {
                return calledDragStart.current;
            },
        })
    ).current;

    function handlePress() {
        if (multiselectEnabled) {
            dispatch(generalStateActions.toggleEventIDSelected({ eventID: props.eventID }));
        }
        else {
            dispatch(eventActions.toggleComplete({ eventID: props.eventID }));
        }
    }

    function handleLongPress(e: GestureResponderEvent) {
        EventRegister.emit('onEventTileLongPressed', {eventID: props.eventID});
        
        
        listeningToMoveEvents.current = true;
        if (Platform.OS == 'android') Vibration.vibrate(10);
    }

    function handleRelease() {
        listeningToMoveEvents.current = false;
        calledDragStart.current = false; // Reactive one time event for drag start.
    }

    function handleDragStart(e: GestureResponderEvent) {
        listeningToMoveEvents.current = false;
        EventRegister.emit('onEventTileDragStart', { gesture: e, eventID: props.eventID });
    }

    return (
        <View {...panResponder.panHandlers} style={{ opacity: isBeingDragged ? 0.25 : 1 }}>
            <TouchableOpacity
                onPress={handlePress}
                onLongPress={handleLongPress}
                delayLongPress={150}
            >
                <EventTile {...props} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    eventTileSize: {
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
    }
})

export default InteractableEventTile;