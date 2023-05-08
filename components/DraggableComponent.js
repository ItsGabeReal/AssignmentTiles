import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';

export default function DraggableComponent({ children, onDrag, onDrop }) {
    const pan = useRef(new Animated.ValueXY()).current; // Animatable values for the pan position

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true, // Enables/disabled dragging
            onPanResponderMove: (event, gesture) => {
                pan.x.setValue(gesture.dx);
                pan.y.setValue(gesture.dy);

                if (onDrag) onDrag(gesture);
            },
            onPanResponderRelease: (event, gesture) => { // When drag is released
                Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start(); // Return to base position with spring animation
                
                if (onDrop) onDrop(gesture);
            },
        })
    ).current;

    return (
        <Animated.View
            style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }] }}
            {...panResponder.panHandlers}
        >
            { children }
        </Animated.View>
    );
};