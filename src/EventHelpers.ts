import { RepeatSettings } from "../components/EventInput";
import { Event, EventDetails } from "../types/currentVersion";
import DateYMD, { DateYMDHelpers } from "./DateYMD";
import { eventActions } from "./redux/features/events/eventsSlice";
import { getInitialPlannedDateForEvent, rowPlansActions } from "./redux/features/rowPlans/rowPlansSlice";
import { AppDispatch } from "./redux/store";

export function createRepeatedEvents(dispatch: AppDispatch, details: EventDetails, repeatSettings: RepeatSettings, skipFirstEvent?: boolean) {
    let startDate = details.dueDate || DateYMDHelpers.today();

    for (let i = 0; i < repeatSettings.recurrences; i++) {
        if (skipFirstEvent && i === 0) continue; // Don't create the first event. Useful when event is edited.

        let dueDate = startDate;
        if (repeatSettings.valueType === 'days') dueDate = DateYMDHelpers.addDays(startDate, i * repeatSettings.value);

        const repeatedEventDetails: EventDetails = {
            ...details,
            dueDate,
        }

        createEvent(dispatch, repeatedEventDetails);
    }
}

// A standardized way to create events and call the proper dispatches
export function createEvent(dispatch: AppDispatch, details: EventDetails, initialPlannedDate?: DateYMD) {
    const newEvent: Event = {
        details,
        id: Math.random().toString(),
        completed: false,
    }

    dispatch(eventActions.add({event: newEvent}));

    const _plannedDate = initialPlannedDate || getInitialPlannedDateForEvent(details);
    dispatch(rowPlansActions.insertEvent({ eventID: newEvent.id, plannedDate: _plannedDate }))
}

// Makes sure both dispatches get called when deleting an event.
export function deleteEventAndBackup(dispatch: AppDispatch, eventID: string) {
    dispatch(rowPlansActions.removeEventAndBackup({eventID}));
    dispatch(eventActions.removeAndBackup({eventID}));
}

export function deleteMultipleEventsAndBackup(dispatch: AppDispatch, eventIDs: string[]) {
    dispatch(rowPlansActions.removeMultipleEventsAndBackup({ eventIDs }));
    dispatch(eventActions.removeMultipleAndBackup({ eventIDs }));
}

export function restoreDeletedEventsFromBackup(dispatch: AppDispatch) {
    dispatch(rowPlansActions.restoreBackup());
    dispatch(eventActions.restoreBackup());
}

export const nullEventDetails: EventDetails = {
    name: 'null',
    categoryID: null,
    dueDate: null,
    notes: '',
}

export const nullEvnet: Event = {
    details: nullEventDetails,
    completed: false,
    id: '',
}