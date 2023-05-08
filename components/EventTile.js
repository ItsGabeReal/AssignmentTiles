import { Component, useContext, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import EventContext from '../context/EventContext';
import DraggableComponent from './DraggableComponent';

export default function EventTile({ eventIndex }) {
    const contextValue = useContext(EventContext);

    function onDrop(gesture) {
        // get a list of all day rows
        // if any overlapped:
            // move tile to the overlapped day row
            // update the pan location with the offset between base positions
        console.log(gesture)
    }

    return (
        <DraggableComponent onDrop={onDrop}>
            <View style={styles.eventTile}>
                <Text style={styles.eventNameText}>{contextValue.events[eventIndex].name}</Text>
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
