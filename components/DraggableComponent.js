import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';

export default function DraggableComponent({ children }) {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([
                null,
                { dx: pan.x, dy: pan.y },
            ], { useNativeDriver: false }),
            onPanResponderRelease: () => {
                Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, }).start();
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