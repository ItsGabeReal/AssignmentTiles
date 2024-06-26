import React from 'react';
import {
    TouchableOpacity,
    GestureResponderEvent,
    StyleSheet,
} from 'react-native';
import DateYMD from '../src/DateYMD';
import EventTile from './EventTile';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { generalStateActions } from '../src/redux/features/general/generalSlice';
import { eventActions } from '../src/redux/features/events/eventsSlice';
import { EventRegister } from 'react-native-event-listeners';
import Checkbox from './core/input/Checkbox';
import VisualSettings from '../src/VisualSettings';

type InteractableEventTileProps = {
    /**
     * The id of the event this tile represents.
     */
    eventID: string;

    /**
     * The date on which this event is scheduled.
     */
    plannedDate: DateYMD;
}

const InteractableEventTile: React.FC<InteractableEventTileProps> = (props) => {
    const dispatch = useAppDispatch();

    const isBeingDragged = useAppSelector(state => state.general.draggedEvent?.eventID === props.eventID);
    const multiselectEnabled = useAppSelector(state => state.general.multiselect.enabled);
    const eventCompleted = useAppSelector(state => state.events.current[props.eventID].completed);

    function handlePress() {
        if (multiselectEnabled) {
            dispatch(generalStateActions.toggleEventIDSelected({ eventID: props.eventID }));
        }
        else {
            EventRegister.emit('onEventTilePressed', { eventID: props.eventID });
        }
    }
    
    function handleLongPress(e: GestureResponderEvent) {
        EventRegister.emit('onEventTileLongPressed', { eventID: props.eventID, gesture: e });
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={150}
            style={styles.tileMargin}
        >
            <EventTile {...props} beingDragged={isBeingDragged} />
            {multiselectEnabled ? null :
                <Checkbox
                    value={eventCompleted}
                    visualStyle='round'
                    color={eventCompleted ? '#0E0' : '#FFFFFF80'}
                    size={24}
                    style={[styles.checkbox, {opacity: isBeingDragged ? 0.25 : 1}]}
                    onChange={() => { dispatch(eventActions.toggleComplete({ eventID: props.eventID })) }}
                />
            }

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    tileMargin: {
        marginRight: VisualSettings.EventTile.margin.right,
        marginBottom: VisualSettings.EventTile.margin.bottom
    },
    checkbox: {
        position: 'absolute',
        right: 2,
        top: 2
    }
});

export default InteractableEventTile;