import React, { useContext } from "react"
import { Event, EventDetails } from "../types/EventTypes"
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

    function handleOnSubmit(details: EventDetails) {
        if (!props.editedEvent) {
            console.error(`Initial edited event was null. Event editor has no idea what event it's supposed to edit.`);
            return;
        }
        
        dispatch(editEvent({
            eventID: props.editedEvent.id,
            newDetails: details,
        }));
    }
    
    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInputModal
                visible={props.visible}
                editingEvent
                initialName={props.editedEvent?.details.name}
                initialDueDate={props.editedEvent?.details.dueDate}
                initialCategoryID={props.editedEvent?.details.categoryID}
                onRequestClose={props.onRequestClose}
                onSubmit={handleOnSubmit}
            />
        </DefaultModal>
        
    );
}

export default EventEditor;