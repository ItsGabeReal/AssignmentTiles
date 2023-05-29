import React, { useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import DateYMD from '../src/DateYMD';
import { EventDetails } from '../types/EventTypes';
import CallbackContext from '../context/CallbackContext';
import DraggableComponent from './DraggableComponent';
import VisualSettings from '../src/VisualSettings';

type EvenTileProps = {
    event: EventDetails;
    plannedDate: DateYMD;
}

const EventTile: React.FC<EvenTileProps> = (props) => {
    const callbackContext = useContext(CallbackContext);

    function getBackgroundColor() {
        if (props.event.dueDate) {
            const isPastDueDate = props.plannedDate.isAfter(props.event.dueDate);
            if (isPastDueDate) {
                return '#fbb';
            }
            else {
                return '#bfb';
            }
        }

        return '#bb';
    }
    
    return (
        <DraggableComponent
            onStartDrag={gesture => callbackContext?.onTileDragStart(gesture)}
            onDrop={gesture => callbackContext?.onTileDropped(gesture, props.event)}
            onPress={gesture => callbackContext?.onTilePressed(gesture, props.event)}
        >
            <View style={{...styles.mainContainer, backgroundColor: getBackgroundColor()}}>
                <View>
                    <Text style={styles.eventNameText}>{props.event.name}</Text>
                    <Text style={styles.dueDateText}>Due: {props.event.dueDate?.dayNameAbrev()}</Text>
                </View>
            </View>
        </DraggableComponent>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
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
    },
    dueDateText: {
        textAlign: 'center',
        fontSize: 12
    },
});

export default EventTile;