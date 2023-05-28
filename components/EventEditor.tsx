import React from "react"
import { EventDetails } from "../types/EventTypes"
import EventInput from "./EventInput"
import { Modal } from "react-native";

type EventEditorProps = {
    visible: boolean;

    editedEvent?: EventDetails;

    onSubmit: ((eventDetails: EventDetails) => void);

    onRequestClose: (() => void);
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
        <Modal
            animationType="slide"
            visible={props.visible}
            onRequestClose={props.onRequestClose}
            presentationStyle="pageSheet"
        >
            <EventInput submitButtonTitle="Save"
                initialName={props.editedEvent?.name}
                initialDueDate={props.editedEvent?.dueDate}
                onSubmit={handleOnSubmit} />
        </Modal>
        
    );
}

export default EventEditor;