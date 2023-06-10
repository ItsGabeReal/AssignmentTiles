import React, { useContext } from "react"
import { EventDetails } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DefaultModal from "./DefaultModal"
import EventDataContext from "../context/EventDataContext"

type EventEditorProps = {
    visible: boolean;

    editedEvent?: EventDetails;

    onRequestClose: (() => void);
}

const EventEditor: React.FC<EventEditorProps> = (props) => {
    const eventData = useContext(EventDataContext);

    function handleOnSubmit(eventDetails: EventDetails) {
        if (!props.editedEvent) {
            console.error(`Initial edited event was null. Event editor has no idea what event it's supposed to edit.`);
            return;
        }
        
        const outputEvent = eventDetails;
        outputEvent.id = props.editedEvent.id;
        outputEvent.completed = props.editedEvent.completed;
        onSubmit(outputEvent);
    }

    function onSubmit(editedEvent: EventDetails) {
        eventData.dispatch({
            type: 'set-event-details',
            targetEventID: editedEvent.id,
            newEventDetails: editedEvent
        });
    }
    
    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInputModal
                visible={props.visible}
                submitButtonTitle="Save"
                initialName={props.editedEvent?.name}
                initialDueDate={props.editedEvent?.dueDate}
                initialCategoryID={props.editedEvent?.categoryID}
                onRequestClose={props.onRequestClose}
                onSubmit={handleOnSubmit}
            />
        </DefaultModal>
        
    );
}

export default EventEditor;