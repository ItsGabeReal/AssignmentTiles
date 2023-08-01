/**
 * VirtualEventTile (or VET) is a representation of EventTile while being dragged.
 * 
 * It is build to wrap around all instances of InteractableEventTile (or IET). This way,
 * VET is a parent component and can therefore steal the gesture
 * responder when dragging starts.
 * 
 * Here's an overview of the dragging process:
 *   1. User starts dragging an IET after long-pressing.
 * 
 *   2. IET will call VET's init function which initializes its position,
 *      displayed event, and visibility.
 * 
 *   3. setDraggedEvent is dispatched, signaling the IET it is being
 *      dragged so it can adjust its visuals accordingly.
 * 
 *   4. VET steels the gesture responder from IET. This can only happen if
 *      VET is the parent of IET, so all IETs should be contained within VET.
 */

import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    PanResponder,
    GestureResponderEvent,
} from 'react-native';
import { DateYMDHelpers } from '../src/DateYMD';
import EventTile from './EventTile';
import VisualSettings from '../src/VisualSettings';
import { EventRegister } from 'react-native-event-listeners';

export type VirtualEventTileRef = {
    /**
     * Moves the vurtual event tile to the location based on gesture
     * and initializes the tile to represent the provided eventID.
     */
    enable: ((gesture: GestureResponderEvent, eventID: string) => void);
}

type VirtualEventTileProps = {
    //plannedDate: DateYMD; // <- This might get added back to display the correct due date text.

    /**
     * In order for InteractableEventTiles to be dragged, they must be a child of VirtualEventTile.
     * 
     * This way VirtualEventTile is a parent of InteractableEventTiles and can therefore
     * steal pan responder gestures when Interactable is dragged.
     */
    children?: React.ReactNode;
}

const tileWidth = VisualSettings.EventTile.mainContainer.width;
const tileHeight = VisualSettings.EventTile.mainContainer.height;

const VETContainer = forwardRef<VirtualEventTileRef, VirtualEventTileProps>((props, ref) => {
    const [displayedEventID, setDisplayedEventID] = useState('');
    const [visible, setVisible] = useState(false);
    
    const pan = useRef(new Animated.ValueXY);
    const enabled = useRef(false);
    
    useImperativeHandle(ref, () => ({
        enable(gesture, eventID) {
            if (enabled.current) return;

            setDisplayedEventID(eventID);

            pan.current.x.setValue(gesture.nativeEvent.pageX - (tileWidth / 2));
            pan.current.y.setValue(gesture.nativeEvent.pageY - (tileHeight / 2));

            enabled.current = true;
            setVisible(true);
        },
    }));

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: () => enabled.current,
            onPanResponderMove: (e, gesture) => {
                pan.current.x.setValue(gesture.moveX - (tileWidth / 2));
                pan.current.y.setValue(gesture.moveY - (tileHeight / 2));

                EventRegister.emit('onEventTileDrag', {gesture: e});
            },
            onPanResponderRelease: (e) => {
                handleRelease();
            },
            onPanResponderTerminate: (e) => {
                console.warn('InteractableEventTile: pan responder terminated');
                handleRelease();
            },
            onPanResponderTerminationRequest: () => false,
        })
    ).current;

    function handleRelease() {
        enabled.current = false;
        setVisible(false);
        
        EventRegister.emit('onEventTileDropped');
    }

    return (
        <View {...panResponder.panHandlers} pointerEvents={visible ? 'box-only' : 'box-none'}>
            {props.children}
            <Animated.View
                style={[styles.mainContainer, { left: pan.current.x, top: pan.current.y, opacity: visible ? 1 : 0 }]}
                pointerEvents='none'
            >
                <EventTile eventID={displayedEventID} />
            </Animated.View>
        </View>
    );
});

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        opacity: 0.8,
    }
});

export default VETContainer;