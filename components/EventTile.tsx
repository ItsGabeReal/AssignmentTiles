import React, { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import { EventDetails } from '../types/EventTypes';
import CallbackContext from '../context/CallbackContext';
import DraggableComponent from './DraggableComponent';
import VisualSettings from '../src/VisualSettings';

type EvenTileProps = {
    event: EventDetails;
}

const EventTile: React.FC<EvenTileProps> = ({ event }) => {
    const callbackContext = useContext(CallbackContext);
    
    return (
        <DraggableComponent
            onStartDrag={gesture => callbackContext?.onTileDragStart(gesture)}
            onDrop={gesture => callbackContext?.onTileDropped(gesture, event)}
            onPress={gesture => callbackContext?.onTilePressed(gesture, event)}
        >
            <View style={styles.mainContainer}>
                <Text style={styles.eventNameText}>{event.name}</Text>
            </View>
        </DraggableComponent>
        
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#ddd',
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
        marginRight: VisualSettings.EventTile.mainContainer.marginRight,
        marginBottom: VisualSettings.EventTile.mainContainer.marginBottom,
        borderRadius: 5,
        justifyContent: 'center',
        zIndex: 1000,
    },
    eventNameText: {
        textAlign: 'center',
    }
});

export default EventTile;