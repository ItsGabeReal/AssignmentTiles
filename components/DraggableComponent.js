import React, { useRef } from 'react';
import { PanResponder, Animated, TouchableWithoutFeedback } from 'react-native';

export default function DraggableComponent({ children, onStartDrag, onDrag, onDrop }) {
    const draggingEnabled = useRef(false);

    const pan = useRef(new Animated.ValueXY()).current; // Animatable values for the pan position

    const tileOpacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => draggingEnabled.current,
            onPanResponderMove: (event, gesture) => {
                pan.x.setValue(gesture.dx);
                pan.y.setValue(gesture.dy);

                if (onDrag) onDrag(gesture);
            },
            onPanResponderRelease: (event, gesture) => { // When drag is released
                Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start(); // Return to base position with spring animation
                draggingEnabled.current = false;
                tileOpacity.setValue(1);

                if (onDrop) onDrop(gesture);
            },
        })
    ).current;

    function onLongPress() {
        draggingEnabled.current = true;
        tileOpacity.setValue(0.75);
        if (onStartDrag) onStartDrag();
    }

    return (
        <Animated.View
            style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }], opacity: tileOpacity }}
            {...panResponder.panHandlers}
        >
            <TouchableWithoutFeedback onLongPress={onLongPress}>
                {children}
            </TouchableWithoutFeedback>
        </Animated.View>
    );
};