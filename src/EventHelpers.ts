import { Event, EventDetails } from "../types/EventTypes";
import DateYMD from "./DateYMD";
import { addEvent, removeEvent } from "./redux/features/events/eventsSlice";
import { getInitialPlannedDateForEvent, insertEventInRowPlans, removeEventFromRowPlans } from "./redux/features/rowPlans/rowPlansSlice";
import { AppDispatch } from "./redux/store";

// A standardized way to create events and call the proper dispatches
export function createEvent(dispatch: AppDispatch, details: EventDetails, plannedDate?: DateYMD) {
    const newEvent: Event = {
        details,
        id: Math.random().toString(),
        completed: false,
    }

    dispatch(addEvent({ event: newEvent }));

    const _plannedDate = plannedDate || getInitialPlannedDateForEvent(details);
    dispatch(insertEventInRowPlans({ eventID: newEvent.id, plannedDate: _plannedDate }));
}

// Makes sure both dispatches get called when deleting an event.
export function deleteEvent(dispatch: AppDispatch, eventID: string) {
    dispatch(removeEventFromRowPlans({ eventID: eventID }));
    dispatch(removeEvent({ eventID: eventID }));
}