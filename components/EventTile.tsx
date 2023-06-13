import React, { memo, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ColorValue,
} from "react-native";
import DateYMD from '../src/DateYMD';
import { EventDetails, EventTileCallbacks } from '../types/EventTypes';
import Draggable from './core/Draggable';
import VisualSettings from '../src/VisualSettings';
import Icon from "react-native-vector-icons/Ionicons";
import { getCategoryFromID } from '../src/CategoryHelpers';
import CategoryContext from '../context/CategoryContext';
import { areEventsEqual } from '../src/EventDataHelpers';

type EventTileProps = {
    event: EventDetails;
    plannedDate: DateYMD;
    eventTileCallbacks: EventTileCallbacks;
}

function propsAreEqual(prevProps: EventTileProps, newProps: EventTileProps) {
    return areEventsEqual(prevProps.event, newProps.event);
}

const EventTile: React.FC<EventTileProps> = memo((props) => {
    const categories = useContext(CategoryContext);

    const daysPlannedBeforeDue = getDaysPlannedBeforeDue();

    function getDaysPlannedBeforeDue() {
        if (props.event.dueDate) {
            return props.plannedDate.daysBefore(props.event.dueDate);
        }
    }

    function getBackgroundColor() {
        let outputColorValue: ColorValue = '#fff';

        if (props.event.categoryID) {
            const category = getCategoryFromID(categories.state, props.event.categoryID);
            if (!category) {
                console.error('EventTile/getBackgroundColor: Could not find category from id');
            }
            else {
                outputColorValue = category.color;
            }
        }

        return outputColorValue;
    }

    function getDueDateTextColor() {
        if (daysPlannedBeforeDue != undefined) {
            if (daysPlannedBeforeDue > 0) {
                return '#0f0';
            }
            else if (daysPlannedBeforeDue < 0) {
                return '#f00';
            }
        }

        return '#fff';
    }

    function getDueDateText() {
        if (daysPlannedBeforeDue != undefined) {
            if (daysPlannedBeforeDue > 0) {
                return `${daysPlannedBeforeDue} ${daysPlannedBeforeDue === 1 ? 'day' : 'days'} early`;
            }
            else if (daysPlannedBeforeDue < 0) {
                return `${daysPlannedBeforeDue * -1} ${daysPlannedBeforeDue === -1 ? 'day' : 'days'} late`;
            }
            else {
                return 'Due Today';
            }
        }

        return '';
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
            onPress={gesture => props.eventTileCallbacks.onTilePressed?.(gesture, props.event)}
            onLongPress={gesture => props.eventTileCallbacks.onTileLongPressed?.(gesture, props.event)}
            onLongPressRelease={() => props.eventTileCallbacks.onTileLongPressRelease?.()}
            onStartDrag={gesture => props.eventTileCallbacks.onTileDragStart?.(gesture)}
            onDrop={gesture => props.eventTileCallbacks.onTileDropped?.(gesture, props.event)}
        >
            <View style={styles.mainContainer}>
                <View style={[styles.tileBackground, {backgroundColor: getBackgroundColor(), opacity: props.event.completed ? 0.25 : 1}]}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.eventNameText}>{props.event.name}</Text>
                        <Text style={[styles.dueDateText, {color: getDueDateTextColor()}]}>{getDueDateText()}</Text>
                    </View>
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
        borderRadius: 10,
        overflow: 'hidden'
    },
    tileBackground: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#0005',
        padding: 5,
    },
    eventNameText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dueDateText: {
        textAlign: 'center',
        fontSize: 12,
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