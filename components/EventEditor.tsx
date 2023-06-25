import React from "react"
import { EventDetails } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DefaultModal from "./DefaultModal"
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { eventActions } from "../src/redux/features/events/eventsSlice";
import { nullEventDetails } from "../src/EventHelpers";

type EventEditorProps = {
    visible: boolean;

    /**
     * The event ID of the event to be edited.
     */
    editedEventID?: string;

    /**
     * When the modal wants to close. Should set visible to false.
     */
    onRequestClose: (() => void);
}

const EventEditor: React.FC<EventEditorProps> = (props) => {
    const dispatch = useAppDispatch();
    const editedEventDetails = useAppSelector(state => state.events.find(item => item.id === props.editedEventID)?.details) || nullEventDetails;

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
                mode='edit'
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