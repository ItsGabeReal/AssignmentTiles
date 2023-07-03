import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
    StyleSheet,
    Animated,
    PanResponder,
    GestureResponderEvent,
} from 'react-native';
import { DateYMDHelpers } from '../src/DateYMD';
import EventTile from './EventTile';
import VisualSettings from '../src/VisualSettings';
import { Vector2D } from '../types/General';

export type VirtualEventTileRef = {
    /**
     * Show the virtual evnet tile.
     */
    show: ((eventID: string, initialPosition: Vector2D) => void);

    /**
     * Hides the virtual event tile.
     */
    hide: (() => void);
}

type VirtualEventTileProps = {
    //plannedDate: DateYMD; // <- This might get added back to display the correct due date text.

    /**
     * Called when the user drops the virtual tile.
     */
    onDrop?: (() => void);

    /**
     * 
     */
    onDrag?: ((event: GestureResponderEvent) => void)
}

const tileWidth = VisualSettings.EventTile.mainContainer.width;
const tileHeight = VisualSettings.EventTile.mainContainer.height;

const VirtualEventTile = forwardRef<VirtualEventTileRef, VirtualEventTileProps>((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [displayedEventID, setDisplayedEventID] = useState('');
    
    const pan = useRef(new Animated.ValueXY);
    const listeningToMoveEvents = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: () => { console.log('req'); return listeningToMoveEvents.current; },
            onPanResponderMove: (e, gesture) => {
                console.log('move')
                //pan.current.x.setValue(gesture.moveX - (tileWidth / 2));
                //pan.current.y.setValue(gesture.moveY - (tileHeight / 2));
                props.onDrag?.(e);
            },
            onPanResponderRelease: (e) => {
                console.log('bye')
                handleRelease();
            },
            onPanResponderTerminate: (e) => {
                console.warn('InteractableEventTile: pan responder terminated');
                handleRelease();
            },
        })
    ).current;
    
    useImperativeHandle(ref, () => ({
        show(eventID, initialPosition) {
            setVisible(true);
            setDisplayedEventID(eventID);

            pan.current.x.setValue(initialPosition.x - (tileWidth / 2));
            pan.current.y.setValue(initialPosition.y - (tileHeight / 2));
        },
        hide() {
            setVisible(false);
        }
    }));

    function handleRelease() {
        listeningToMoveEvents.current = false;
        props.onDrop?.();
    }

    if (!visible) return(<></>);

    return (
        <Animated.View
            style={[styles.mainContainer, {left: pan.current.x, top: pan.current.y}]}
            {...panResponder.panHandlers}
        >
            <EventTile eventID={displayedEventID} plannedDate={DateYMDHelpers.today()} />
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        opacity: 0.8,
    }
});

export default VirtualEventTile;