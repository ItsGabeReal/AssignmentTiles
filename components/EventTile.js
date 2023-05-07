import { Component, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    PanResponder // <- I think this is what I need for drag & drop stuff
} from "react-native";
import DraggableComponent from './DraggableComponent';

export default function EventTile({ eventIndex, eventData }) {
    return (
        <DraggableComponent>
            <View style={styles.eventTile}>
                <Text style={styles.eventNameText}>{eventData[eventIndex].name}</Text>
            </View>
        </DraggableComponent>
    )
};

const styles = StyleSheet.create({
    eventTile: {
        backgroundColor: '#ddd',
        height: 80,
        width: 80,
        marginRight: 5,
        marginBottom: 5,
        borderRadius: 5,
        justifyContent: 'center',
    },
    eventNameText: {
        textAlign: 'center',
    }
});
