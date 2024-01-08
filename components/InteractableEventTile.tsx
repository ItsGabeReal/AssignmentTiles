import React from 'react';
import {
    View,
    TouchableOpacity,
    GestureResponderEvent,
} from 'react-native';
import DateYMD from '../src/DateYMD';
import EventTile from './EventTile';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { generalStateActions } from '../src/redux/features/general/generalSlice';
import { eventActions } from '../src/redux/features/events/eventsSlice';
import { EventRegister } from 'react-native-event-listeners';
import { activeOpacity } from '../src/GlobalStyles';
import Checkbox from './core/Checkbox';

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

    const isBeingDragged = useAppSelector(state => state.general.draggedEvent?.eventID ? (state.general.draggedEvent.eventID === props.eventID) : false);
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
        <View style={{ opacity: isBeingDragged ? 0.25 : 1 }}>
            <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={handlePress}
                onLongPress={handleLongPress}
                delayLongPress={150}
            >
                <EventTile {...props} />
                <View style={{position: 'absolute', left: 0, top: 0}}>
                    <Checkbox value={eventCompleted} visualStyle='round' color={eventCompleted ? '#00FF00' : '#FFFFFF80'} size={26} onChange={() => {dispatch(eventActions.toggleComplete({eventID: props.eventID}))}}/>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default InteractableEventTile;