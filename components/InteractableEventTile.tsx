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
import { useAppSelector } from '../src/redux/hooks';
import VisualSettings from '../src/VisualSettings';
import { EventTileCallbacks } from '../types/General';

type InteractableEventTileProps = {
    /**
     * The if of the event this tile represents.
     */
    eventID: string;

    /**
     * The date on which this event is scheduled.
     */
    plannedDate: DateYMD;

    /**
     * Callbacks to MainScreen to alert it when events occur.
     */
    eventTileCallbacks: EventTileCallbacks;
}

const DRAG_START_DISTANCE = 5;

const InteractableEventTile: React.FC<InteractableEventTileProps> = (props) => {
    const isBeingDragged = useAppSelector(state => state.general.draggedEvent?.eventID ? (state.general.draggedEvent.eventID === props.eventID) : false);

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
                // Reactive one time event for drag start.
                calledDragStart.current = false;

            },
            onPanResponderTerminate() {
                // Reactive one time event for drag start.
                calledDragStart.current = false;
            },
            onPanResponderTerminationRequest(e, gestureState) {
                return calledDragStart.current;
            },
        })
    ).current;

    function handleLongPress(e: GestureResponderEvent) {
        listeningToMoveEvents.current = true;
        if (Platform.OS == 'android') Vibration.vibrate(10);
        props.eventTileCallbacks.onTileLongPressed?.(e, props.eventID);
    }

    function handleDragStart(e: GestureResponderEvent) {
        listeningToMoveEvents.current = false;
        props.eventTileCallbacks.onTileDragStart?.(e, props.eventID);
    }

    return (
        <View {...panResponder.panHandlers} style={{ opacity: isBeingDragged ? 0.25 : 1 }}>
            <TouchableOpacity
                onPress={gesture => props.eventTileCallbacks.onTilePressed?.(gesture, props.eventID)}
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