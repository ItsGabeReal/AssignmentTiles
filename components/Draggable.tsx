import React, { useRef } from 'react';
import {
    TouchableWithoutFeedbackProps,
    PanResponder,
    Animated,
    TouchableWithoutFeedback,
    GestureResponderEvent,
    PanResponderGestureState,
    Vibration,
    Platform,
} from 'react-native';

type DraggableProps = TouchableWithoutFeedbackProps & {
    onLongPressRelease?: (() => void);
    onStartDrag?: ((gesture: PanResponderGestureState) => void);
    onDrop?: ((gesture: PanResponderGestureState) => void);
}

const DRAG_START_DISTANCE = 3;

const Draggable: React.FC<DraggableProps> = (props) => {
    const { onLongPress, ...otherProps } = props;

    const listeningToMoveEvents = useRef(false);
    const draggingEnabled = useRef(false);

    const pan = useRef(new Animated.ValueXY()).current; // Animatable values for the pan position

    const tileOpacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => listeningToMoveEvents.current,
            onPanResponderMove: (event, gesture) => {
                if (draggingEnabled.current) {
                    pan.x.setValue(gesture.dx);
                    pan.y.setValue(gesture.dy);
                }
                else {
                    const dragDistance = Math.sqrt(Math.pow(gesture.dx, 2) + Math.pow(gesture.dy, 2));

                    if (dragDistance > DRAG_START_DISTANCE) onStartDrag(gesture);
                }
            },
            onPanResponderRelease: (event, gesture) => { // When drag is released
                handleDragRelease(gesture);
            },
            onPanResponderTerminate(e, gestureState) {
                console.warn('pan responder terminated');
                handleDragRelease(gestureState);
            },
        })
    ).current;

    function handleDragRelease(gesture: PanResponderGestureState) {
        props.onLongPressRelease?.();

        listeningToMoveEvents.current = false;

        if (draggingEnabled.current) {
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start(); // Return to base position with spring animation
            draggingEnabled.current = false;
            tileOpacity.setValue(1);
            props.onDrop?.(gesture);
        }
    }

    function onStartDrag(gesture: PanResponderGestureState) {
        draggingEnabled.current = true;
        tileOpacity.setValue(0.75);
        props.onStartDrag?.(gesture);
    }

    function handleLongPress(gesture: GestureResponderEvent) {
        listeningToMoveEvents.current = true;
        if (Platform.OS == 'android') Vibration.vibrate(10);
        onLongPress?.(gesture);
    }

    return (
        <Animated.View
            style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }], opacity: tileOpacity }}
            {...panResponder.panHandlers}
        >
            <TouchableWithoutFeedback onLongPress={handleLongPress} delayLongPress={150} {...otherProps}>
                {props.children}
            </TouchableWithoutFeedback>
        </Animated.View>
    );
};

export default Draggable;