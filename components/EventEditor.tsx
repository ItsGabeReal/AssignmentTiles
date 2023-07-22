import React, {useState, useRef, forwardRef, useImperativeHandle} from "react"
import { DueDate, EventDetails } from "../types/v0"
import EventInputModal, { RepeatSettings } from "./EventInput"
import DefaultModal from "./DefaultModal"
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { eventActions, getEventFromID, selectEventFromID } from "../src/redux/features/events/eventsSlice";
import { createRepeatedEvents, nullEventDetails } from "../src/EventHelpers";
import { DateYMDHelpers } from "../src/DateYMD";
import { rowPlansActions } from "../src/redux/features/rowPlans/rowPlansSlice";
import { colors } from "../src/GlobalStyles";

export type EventEditorRef = {
    /**
     * Opens the event editor modal with the id of the event to be edited.
     */
    open: ((editedEventID: string) => void);
}

type EventEditorProps = {
}

const EventEditor = forwardRef<EventEditorRef, EventEditorProps>((props, ref) => {
    const dispatch = useAppDispatch();
    
    const [visible, setVisible] = useState(false);
    const [editedEventID, setEditedEventID] = useState<string>('');

    const editedEventDetails = useAppSelector(selectEventFromID(editedEventID)) || nullEventDetails;

    useImperativeHandle(ref, () => ({
        open(_editedEventID: string) {
            setEditedEventID(_editedEventID);
            setVisible(true);
        }
    }));

    function handleOnSubmit(details: EventDetails, repeatSettings: RepeatSettings | null) {
        if (editedEventIsUndefined()) {
            console.error(`Edited event id was not defined. Event editor has no idea what event it's supposed to edit.`);
            return;
        }

        changePlannedDateIfDueDateWasChanged(editedEventDetails.dueDate, details.dueDate);
        
        applyEventEdits(details);

        if (repeatSettings) {
            createRepeatedEvents(dispatch, details, repeatSettings, true);
        }
    }

    function editedEventIsUndefined() {
        return editedEventID === '';
    }

    function changePlannedDateIfDueDateWasChanged(before: DueDate, after: DueDate) {
        const dueDateIsDifferent = !DateYMDHelpers.datesEqual(before, after);
        const newDateIsValid = after !== null;

        if (dueDateIsDifferent && newDateIsValid) {
            dispatch(rowPlansActions.changePlannedDate({ eventID: editedEventID, plannedDate: after }));
        }
    }

    function applyEventEdits(newDetails: EventDetails) {
        dispatch(eventActions.edit({
            eventID: editedEventID,
            newDetails: newDetails,
        }));
    }

    function close() {
        setVisible(false);
    }
    
    return (
        <DefaultModal visible={visible} onRequestClose={close} backgroundColor={colors.l1}>
            <EventInputModal
                mode='edit'
                initialName={editedEventDetails.name}
                initialDueDate={editedEventDetails.dueDate}
                initialCategoryID={editedEventDetails.categoryID}
                initialNotes={editedEventDetails.notes}
                onRequestClose={close}
                onSubmit={handleOnSubmit}
            />
        </DefaultModal>
    );
});

export default EventEditor;