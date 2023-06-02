import React, { useContext, memo } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import DateYMD from '../src/DateYMD';
import { EventDetails, EventTileCallbacks } from '../types/EventTypes';
import Draggable from './Draggable';
import VisualSettings from '../src/VisualSettings';
import Icon from "react-native-vector-icons/Ionicons";

type EventTileProps = {
    event: EventDetails;
    plannedDate: DateYMD;
    eventTileCallbacks: EventTileCallbacks;
}

function propsAreEqual(prevProps: EventTileProps, newProps: EventTileProps) {
    return prevProps.event.completed === newProps.event.completed
        && prevProps.event.dueDate == newProps.event.dueDate
        && prevProps.event.name == newProps.event.name;
}

const EventTile: React.FC<EventTileProps> = memo((props) => {
    console.log(`${props.event.name} updated`);

    function getBackgroundColor() {
        let output;

        if (props.event.dueDate) {
            const isPastDueDate = props.plannedDate.isAfter(props.event.dueDate);
            if (isPastDueDate) {
                output = '#fbb';
            }
            else {
                output = '#bfb';
            }
        }

        return output || '#bbb';
    }

    function checkmark() {
        return (
            <View style={styles.checkmarkOverlayContainer}>
                <Icon name='ios-checkmark' size={60} color='#0d0' />
            </View>
        );
    }
    
    return (
        <Draggable
            onPress={gesture => props.eventTileCallbacks.onTilePressed(gesture, props.event)}
            onLongPress={gesture => props.eventTileCallbacks.onTileLongPressed(gesture, props.event)}
            onLongPressRelease={() => props.eventTileCallbacks.onTileLongPressRelease()}
            onStartDrag={gesture => props.eventTileCallbacks.onTileDragStart(gesture)}
            onDrop={gesture => props.eventTileCallbacks.onTileDropped(gesture, props.event)}
        >
            <View style={styles.mainContainer}>
                <View style={[styles.contentContainer, {backgroundColor: getBackgroundColor(), opacity: props.event.completed ? 0.25 : 1}]}>
                    <Text style={styles.eventNameText}>{props.event.name}</Text>
                    <Text style={styles.dueDateText}>Due: {props.event.dueDate?.dayNameAbrev()}</Text>
                </View>
                {props.event.completed ? checkmark() : null}
            </View>
        </Draggable>
    );
}, propsAreEqual);

const styles = StyleSheet.create({
    mainContainer: {
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
        marginRight: VisualSettings.EventTile.mainContainer.marginRight,
        marginBottom: VisualSettings.EventTile.mainContainer.marginBottom,
    },
    contentContainer: {
        borderRadius: 10,
        justifyContent: 'center',
        flex: 1,
    },
    eventNameText: {
        textAlign: 'center',
    },
    dueDateText: {
        textAlign: 'center',
        fontSize: 12
    },
    checkmarkOverlayContainer: {
        position: 'absolute',
        width: VisualSettings.EventTile.mainContainer.width,
        height: VisualSettings.EventTile.mainContainer.height,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default EventTile;