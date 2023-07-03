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
import { EventTileCallbacks } from '../types/EventTile';
import { useAppSelector } from '../src/redux/hooks';
import VisualSettings from '../src/VisualSettings';

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
    const currentDraggedEvent = useAppSelector(state => state.general.draggedEvent);
    
    const listeningToMoveEvents = useRef(false);

    const isBeingDragged = currentDraggedEvent ? (currentDraggedEvent.eventID === props.eventID) : false;
    
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => {console.log('req'); return listeningToMoveEvents.current;},
            onPanResponderMove: (e, gesture) => {
                const dragDistance = Math.sqrt(Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2));

                if (dragDistance > DRAG_START_DISTANCE) {
                    listeningToMoveEvents.current = false;
                    props.eventTileCallbacks.onTileDragStart?.(e, props.eventID);
                }
            },
        })
    ).current;

    function handleLongPress(event: GestureResponderEvent) {
        listeningToMoveEvents.current = true;
        if (Platform.OS == 'android') Vibration.vibrate(10);
        props.eventTileCallbacks.onTileLongPressed?.(event, props.eventID);
    }

    return (
        <View {...panResponder.panHandlers} style={{opacity: isBeingDragged ? 0.25 : 1}}>
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