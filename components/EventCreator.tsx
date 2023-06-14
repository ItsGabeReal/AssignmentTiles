import React, { useContext } from "react"
import { Event } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DateYMD from "../src/DateYMD";
import DefaultModal from "./DefaultModal";
import eventsContext from "../context/EventsContext";

type EventCreatorProps = {
    visible: boolean;

    initialDueDate?: DateYMD;

    onRequestClose: (() => void);

    onEventCreated?: ((createdEvent: Event) => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    const events = useContext(eventsContext);

    function onSubmit(newEvent: Event) {
        events.dispatch({
            type: 'add-event',
            event: newEvent,
        });
        
        // Return the new event so it can be added to rowPlans
        props.onEventCreated?.(newEvent);
    }

    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInputModal
                visible={props.visible}
                submitButtonTitle="Create"
                initialDueDate={props.initialDueDate}
                onRequestClose={props.onRequestClose}
                onSubmit={onSubmit}
            />
        </DefaultModal>
    );
}

export default EventCreator;