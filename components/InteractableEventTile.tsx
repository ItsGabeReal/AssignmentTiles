import React, { useRef } from 'react';
import {
    View,
    TouchableOpacity,
    GestureResponderEvent,
    Platform,
    Vibration,
    PanResponder,
} from 'react-native';
import DateYMD from '../src/DateYMD';
import EventTile from './EventTile';
import { EventTileCallbacks } from '../types/EventTile';

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
    const listeningToMoveEvents = useRef(false);
    const panResponderGranted = useRef(false);
    const draggingEnabled = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => listeningToMoveEvents.current,
            onPanResponderGrant: () => {
                panResponderGranted.current = true;
            },
            onPanResponderMove: (e, gesture) => {
                if (draggingEnabled.current) {
                    props.eventTileCallbacks.onTileDrag?.(e, props.eventID);
                }
                else {
                    const dragDistance = Math.sqrt(Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2));

                    if (dragDistance > DRAG_START_DISTANCE) onStartDrag(e);
                }
            },
            onPanResponderRelease: (e) => { // When drag is released.
                panResponderGranted.current = false;
                handleRelease(e);
            },
            onPanResponderTerminate: (e) => {
                console.warn('InteractableEventTile: pan responder terminated');
                panResponderGranted.current = false;
                handleRelease(e);
            },
        })
    ).current;

    function onStartDrag(event: GestureResponderEvent) {
        draggingEnabled.current = true;
        props.eventTileCallbacks.onTileDragStart?.(event, props.eventID);
    }

    function handleRelease(event: GestureResponderEvent) {
        props.eventTileCallbacks.onTileLongPressRelease?.();

        listeningToMoveEvents.current = false;

        if (draggingEnabled.current) {
            draggingEnabled.current = false;
            props.eventTileCallbacks.onTileDropped?.(event, props.eventID);
        }
    }

    function handleLongPress(event: GestureResponderEvent) {
        listeningToMoveEvents.current = true;
        if (Platform.OS == 'android') Vibration.vibrate(10);
        props.eventTileCallbacks.onTileLongPressed?.(event, props.eventID);
    }

    function handlePressOut(event: GestureResponderEvent) {
        /**
         * In the case where a long press is released but the pan responder wasn't granted, make
         * sure releasing gets handled.
         */
        const longPressed = listeningToMoveEvents.current;
        if (longPressed && !panResponderGranted.current) {
            handleRelease(event);
        }
    }

    return (
        <View {...panResponder.panHandlers}>
            <TouchableOpacity
                onPress={gesture => props.eventTileCallbacks.onTilePressed?.(gesture, props.eventID)}
                onLongPress={handleLongPress}
                onPressOut={handlePressOut}
                delayLongPress={150}
            >
                <EventTile {...props} />
            </TouchableOpacity>
        </View>
        
    )
}

export default InteractableEventTile;