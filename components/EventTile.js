import { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import GlobalContext from '../context/GlobalContext';
import DraggableComponent from './DraggableComponent';

export default function EventTile({ event }) {
    const globalContext = useContext(GlobalContext);

    function onDrop(gesture) {
        globalContext.onTileDropped(gesture, event);
    }
    
    return (
        <DraggableComponent onDrop={onDrop}>
            <View style={styles.eventTile}>
                <Text style={styles.eventNameText}>{event.name}</Text>
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
