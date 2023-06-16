import React, { useContext } from "react"
import { Event } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DefaultModal from "./DefaultModal"
import { useAppDispatch } from '../src/redux/hooks';
import { editEvent } from "../src/redux/features/events/eventsSlice"

type EventEditorProps = {
    visible: boolean;

    editedEvent?: Event;

    onRequestClose: (() => void);
}

const EventEditor: React.FC<EventEditorProps> = (props) => {
    const dispatch = useAppDispatch();

    function handleOnSubmit(eventDetails: Event) {
        if (!props.editedEvent) {
            console.error(`Initial edited event was null. Event editor has no idea what event it's supposed to edit.`);
            return;
        }
        
        dispatch(editEvent({
            eventID: props.editedEvent.id,
            name: eventDetails.name,
            categoryID: eventDetails.categoryID,
            dueDate: eventDetails.dueDate,
        }));
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