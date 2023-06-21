import React, { useContext } from "react"
import { Event, EventDetails } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DefaultModal from "./core/DefaultModal"
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { eventActions } from "../src/redux/features/events/eventsSlice";

type EventEditorProps = {
    visible: boolean;

    editedEventID?: string;

    onRequestClose: (() => void);
}

const EventEditor: React.FC<EventEditorProps> = (props) => {
    const dispatch = useAppDispatch();
    const editedEventDetails = useAppSelector(state => state.events.find(item => item.id === props.editedEventID)?.details) || {name: 'null', categoryID: null, dueDate: null};

    function handleOnSubmit(details: EventDetails) {
        if (!props.editedEventID) {
            console.error(`Initial edited event was null. Event editor has no idea what event it's supposed to edit.`);
            return;
        }
        
        dispatch(eventActions.edit({
            eventID: props.editedEventID,
            newDetails: details,
        }))
    }
    
    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInputModal
                visible={props.visible}
                editingEvent
                initialName={editedEventDetails.name}
                initialDueDate={editedEventDetails.dueDate}
                initialCategoryID={editedEventDetails.categoryID}
                onRequestClose={props.onRequestClose}
                onSubmit={handleOnSubmit}
            />
        </DefaultModal>
        
    );
}

export default EventEditor;