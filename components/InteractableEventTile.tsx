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
            </TouchableOpacity>
        </View>
    )
}

export default InteractableEventTile;