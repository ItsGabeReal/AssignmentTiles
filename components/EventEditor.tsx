import React from "react"
import { EventDetails } from "../types/EventTypes"
import EventInputModal from "./EventInputModal"
import { Modal } from "react-native";

type EventEditorProps = {
    visible: boolean;

    editedEvent?: EventDetails;

    onRequestClose: (() => void);

    onSubmit: ((eventDetails: EventDetails) => void);
}

const EventEditor: React.FC<EventEditorProps> = (props) => {
    function handleOnSubmit(eventDetails: EventDetails) {
        if (!props.editedEvent) {
            console.error(`Initial edited event was null. Event editor has no idea what event it's supposed to edit.`);
            return;
        }
        
        const outputEvent = eventDetails;
        outputEvent.id = props.editedEvent.id;
        props.onSubmit(outputEvent);
    }
    
    return (
        <EventInputModal
            visible={props.visible}
            submitButtonTitle="Save"
            initialName={props.editedEvent?.name}
            initialDueDate={props.editedEvent?.dueDate}
            onRequestClose={props.onRequestClose}
            onSubmit={handleOnSubmit}
        />
    );
}

export default EventEditor;