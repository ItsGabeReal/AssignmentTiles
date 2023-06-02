import React, { useRef } from 'react';
import {
    TouchableWithoutFeedbackProps,
    PanResponder,
    Animated,
    TouchableWithoutFeedback,
    GestureResponderEvent,
    Vibration,
    Platform,
} from 'react-native';

type DraggableProps = TouchableWithoutFeedbackProps & {
    onLongPressRelease?: (() => void);
    onStartDrag?: ((event: GestureResponderEvent) => void);
    onDrop?: ((event: GestureResponderEvent) => void);
}

const DRAG_START_DISTANCE = 3;

const Draggable: React.FC<DraggableProps> = (props) => {
    const { onLongPress, ...otherProps } = props;

    const listeningToMoveEvents = useRef(false);
    const panResponderGranted = useRef(false);
    const draggingEnabled = useRef(false);

    const pan = useRef(new Animated.ValueXY()).current; // Animatable values for the pan position

    const tileOpacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => listeningToMoveEvents.current,
            onPanResponderGrant: () => {
                panResponderGranted.current = true;
            },
            onPanResponderMove: (event, gesture) => {
                if (draggingEnabled.current) {
                    pan.x.setValue(gesture.dx);
                    pan.y.setValue(gesture.dy);
                }
                else {
                    const dragDistance = Math.sqrt(Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2));

                    if (dragDistance > DRAG_START_DISTANCE) onStartDrag(event);
                }
            },
            onPanResponderRelease: (event) => { // When drag is released.
                panResponderGranted.current = false;
                handleRelease(event);
            },
            onPanResponderTerminate(event) {
                console.warn('pan responder terminated');
                panResponderGranted.current = false;
                handleRelease(event);
            },
        })
    ).current;

    function handleRelease(event: GestureResponderEvent) {
        props.onLongPressRelease?.();

        listeningToMoveEvents.current = false;

        if (draggingEnabled.current) {
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start(); // Return to base position with spring animation
            draggingEnabled.current = false;
            tileOpacity.setValue(1);
            props.onDrop?.(event);
        }
    }

    function onStartDrag(event: GestureResponderEvent) {
        draggingEnabled.current = true;
        tileOpacity.setValue(0.75);
        props.onStartDrag?.(event);
    }

    function handleLongPress(event: GestureResponderEvent) {
        listeningToMoveEvents.current = true;
        if (Platform.OS == 'android') Vibration.vibrate(10);
        onLongPress?.(event);
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
        <Animated.View
            style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }], opacity: tileOpacity }}
            {...panResponder.panHandlers}
        >
            <TouchableWithoutFeedback onLongPress={handleLongPress} onPressOut={handlePressOut} delayLongPress={150} {...otherProps}>
                {props.children}
            </TouchableWithoutFeedback>
        </Animated.View>
    );
};

export default Draggable;