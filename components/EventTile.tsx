import React, { memo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ColorValue,
} from "react-native";
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import { Event, EventTileCallbacks } from '../types/EventTypes';
import Draggable from './core/Draggable';
import VisualSettings from '../src/VisualSettings';
import Icon from "react-native-vector-icons/Ionicons";
import { useAppSelector } from '../src/redux/hooks';
import { getCategoryFromID } from '../src/redux/features/categories/categoriesSlice';

type EventTileProps = {
    eventID: string;
    plannedDate: DateYMD;
    eventTileCallbacks: EventTileCallbacks;
}

const EventTile: React.FC<EventTileProps> = memo((props) => {
    const event = useAppSelector(state => state.events.find(item => item.id === props.eventID));
    if (!event) console.warn(`EventTile: event is undefined`);
    const eventButNotUndefined: Event = event || {name: 'null', completed: false, id: '', categoryID: null};

    const categories = useAppSelector(state => state.categories);

    const daysPlannedBeforeDue = getDaysPlannedBeforeDue();

    function getDaysPlannedBeforeDue() {
        if (eventButNotUndefined.dueDate) {
            return DateYMDHelpers.daysBefore(eventButNotUndefined.dueDate, props.plannedDate);
        }
    }

    function getBackgroundColor() {
        let outputColorValue: ColorValue = '#fff';

        if (eventButNotUndefined.categoryID !== null) {
            const category = getCategoryFromID(categories, eventButNotUndefined.categoryID);
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
            onPress={gesture => props.eventTileCallbacks.onTilePressed?.(gesture, eventButNotUndefined)}
            onLongPress={gesture => props.eventTileCallbacks.onTileLongPressed?.(gesture, eventButNotUndefined)}
            onLongPressRelease={() => props.eventTileCallbacks.onTileLongPressRelease?.()}
            onStartDrag={gesture => props.eventTileCallbacks.onTileDragStart?.(gesture)}
            onDrop={gesture => props.eventTileCallbacks.onTileDropped?.(gesture, eventButNotUndefined)}
        >
            <View style={styles.mainContainer}>
                <View style={[styles.tileBackground, { backgroundColor: getBackgroundColor(), opacity: eventButNotUndefined.completed ? 0.25 : 1 }]}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.eventNameText}>{eventButNotUndefined.name}</Text>
                        <Text style={[styles.dueDateText, { color: getDueDateTextColor() }]}>{getDueDateText()}</Text>
                    </View>
                </View>
                {eventButNotUndefined.completed ? checkmark() : null}
            </View>
        </Draggable>
    );
}, (prevProps, newProps) => prevProps.eventID === newProps.eventID);

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