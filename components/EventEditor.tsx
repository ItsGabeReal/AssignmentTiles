import React, { useContext } from "react"
import { Event } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DefaultModal from "./DefaultModal"
import eventsContext from "../context/EventsContext"

type EventEditorProps = {
    visible: boolean;

    editedEvent?: Event;

    onRequestClose: (() => void);
}

const EventEditor: React.FC<EventEditorProps> = (props) => {
    const events = useContext(eventsContext);

    function handleOnSubmit(eventDetails: Event) {
        if (!props.editedEvent) {
            console.error(`Initial edited event was null. Event editor has no idea what event it's supposed to edit.`);
            return;
        }
        
        events.dispatch({
            type: 'edit-event',
            eventID: props.editedEvent.id,
            name: eventDetails.name,
            categoryID: eventDetails.categoryID,
            dueDate: eventDetails.dueDate,
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