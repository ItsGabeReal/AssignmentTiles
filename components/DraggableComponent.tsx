import React, { useRef } from 'react';
import {
    TouchableWithoutFeedbackProps,
    PanResponder,
    Animated,
    TouchableWithoutFeedback,
    GestureResponderEvent,
    PanResponderGestureState,
} from 'react-native';

type DraggableComponentProps = Omit<TouchableWithoutFeedbackProps, 'onLongPress'> & {
    onStartDrag?: ((gesture: GestureResponderEvent) => void);
    onDrag?: ((gesture: PanResponderGestureState) => void);
    onDrop?: ((gesture: PanResponderGestureState) => void);
}

const DraggableComponent: React.FC<DraggableComponentProps> = (props) => {
    const draggingEnabled = useRef(false);

    const pan = useRef(new Animated.ValueXY()).current; // Animatable values for the pan position

    const tileOpacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => draggingEnabled.current,
            onPanResponderMove: (event, gesture) => {
                pan.x.setValue(gesture.dx);
                pan.y.setValue(gesture.dy);

                props.onDrag?.(gesture);
            },
            onPanResponderRelease: (event, gesture) => { // When drag is released
                Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start(); // Return to base position with spring animation
                draggingEnabled.current = false;
                tileOpacity.setValue(1);

                props.onDrop?.(gesture);
            },
        })
    ).current;

    function onLongPress(gesture: GestureResponderEvent) {
        draggingEnabled.current = true;
        tileOpacity.setValue(0.75);
        props.onStartDrag?.(gesture);
    }

    return (
        <Animated.View
            style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }], opacity: tileOpacity }}
            {...panResponder.panHandlers}
        >
            <TouchableWithoutFeedback onLongPress={onLongPress} delayLongPress={150} {...props}>
                {props.children}
            </TouchableWithoutFeedback>
        </Animated.View>
    );
};

export default DraggableComponent;