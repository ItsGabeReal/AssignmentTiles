import { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import CallbackContext from '../context/CallbackContext';
import DraggableComponent from './DraggableComponent';
import VisualSettings from '../src/VisualSettings';

export default function EventTile({ event }) {
    const callbackContext = useContext(CallbackContext);
    
    return (
        <DraggableComponent
            onPress={() => callbackContext.tileDeletionTest(event)}
            onStartDrag={() => callbackContext.onTileDragStart()}
            onDrop={gesture => callbackContext.onTileDropped(gesture, event)}
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
