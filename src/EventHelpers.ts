import { Event, EventDetails } from "../types/v0";
import DateYMD from "./DateYMD";
import { eventActions } from "./redux/features/events/eventsSlice";
import { getInitialPlannedDateForEvent, rowPlansActions } from "./redux/features/rowPlans/rowPlansSlice";
import { AppDispatch } from "./redux/store";

// A standardized way to create events and call the proper dispatches
export function createEvent(dispatch: AppDispatch, details: EventDetails, plannedDate?: DateYMD) {
    const newEvent: Event = {
        details,
        id: Math.random().toString(),
        completed: false,
    }

    dispatch(eventActions.add({event: newEvent}));

    const _plannedDate = plannedDate || getInitialPlannedDateForEvent(details);
    dispatch(rowPlansActions.insertEvent({ eventID: newEvent.id, plannedDate: _plannedDate }))
}

// Makes sure both dispatches get called when deleting an event.
export function deleteEvent(dispatch: AppDispatch, eventID: string) {
    dispatch(rowPlansActions.removeEvent({eventID}));
    dispatch(eventActions.remove({eventID}));
}

export const nullEventDetails: EventDetails = {
    name: 'null',
    categoryID: null,
    dueDate: null,
}

export const nullEvnet: Event = {
    details: nullEventDetails,
    completed: false,
    id: '',
}