import { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import EventContext from '../context/EventContext';
import DraggableComponent from './DraggableComponent';
import VisualSettings from '../json/VisualSettings.json';

export default function EventTile({ event }) {
    const eventContext = useContext(EventContext);
    
    return (
        <DraggableComponent
            onPress={() => eventContext.tileDeletionTest(event)}
            onStartDrag={() => eventContext.onTileDragStart()}
            onDrop={gesture => eventContext.onTileDropped(gesture, event)}
        >
            <View style={styles.mainContainer}>
                <Text style={styles.eventNameText}>{event.name}</Text>
            </View>
        </DraggableComponent>
        
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#ddd',
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
        marginRight: VisualSettings.EventTile.mainContainer.marginRight,
        marginBottom: VisualSettings.EventTile.mainContainer.marginBottom,
        borderRadius: 5,
        justifyContent: 'center',
        zIndex: 1,
    },
    eventNameText: {
        textAlign: 'center',
    }
});
