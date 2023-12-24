import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event, EventDetails, EventsState } from '../../../../types/store-current';
import { RootState } from '../../store';
import { DateYMDHelpers } from '../../../DateYMD';

const initialState: EventsState = {
    current: {},
    backup: null,
}

export const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        add(state, action: PayloadAction<{event: Event, id: string}>) {
            state.current[action.payload.id] = action.payload.event;
        },
        /**
         * Note: Removing and backing up are combined to ensure that the
         * state is backed up before anything is deleted.
         */
        removeAndBackup(state, action: PayloadAction<{eventID: string}>) {
            state.backup = deepCopyEvents(state.current);

            // Delete event
            delete state.current[action.payload.eventID];
        },
        removeMultipleAndBackup(state, action: PayloadAction<{ eventIDs: string[] }>) {
            state.backup = deepCopyEvents(state.current);

            // Delete events
            action.payload.eventIDs.forEach(id => delete state.current[id]);
        },
        edit(state, action: PayloadAction<{ eventID: string, newDetails: EventDetails}>) {
            const { eventID, newDetails } = action.payload;

            state.current[eventID].details = newDetails;
        },
        toggleComplete(state, action: PayloadAction<{eventID: string}>) {
            const { eventID } = action.payload;
            
            state.current[eventID].completed = !state.current[eventID].completed;
        },
        removeCategoryAndBackup(state, action: PayloadAction<{ categoryID: string }>) {
            state.backup = deepCopyEvents(state.current);
            
            // Find events with this category and set their category to null
            for (let eventID in state.current) {
                if (state.current[eventID].details.categoryID === action.payload.categoryID) {
                    state.current[eventID].details.categoryID = null;
                }
            }
        },
        setCategoryID(state, action: PayloadAction<{ eventID: string, categoryID: string | null }>) {
            const { eventID, categoryID } = action.payload;

            state.current[eventID].details.categoryID = categoryID;
        },
        restoreBackup(state) {
            if (!state.backup) {
                console.warn('eventsSlice -> restoreBackup: No backup to restore. Be sure to call "backup" first.');
                return;
            }

            state.current = deepCopyEvents(state.backup);
        },
    },
});

function deepCopyEvents(events: {[key: string]: Event}) {
    const output: {[key: string]: Event} = {};

    for (let key in events) {
        const event = events[key];

        const dueDateCopy = event.details.dueDate ? {...event.details.dueDate} : null;

        const eventDetailsCopy: EventDetails = {
            ...event.details,
            dueDate: dueDateCopy,
        }

        output[key] = {
            ...event,
            details: eventDetailsCopy
        }
    }

    return output;
}

export function areEventsEqual(eventA: Event, eventB: Event) {
    return eventA.completed === eventB.completed
        && eventA.details.name === eventB.details.name
        && DateYMDHelpers.datesEqual(eventA.details.dueDate, eventB.details.dueDate)
        && eventA.details.categoryID === eventB.details.categoryID
        && eventA.details.notes === eventB.details.notes;
}

export const eventActions = eventsSlice.actions;

export default eventsSlice.reducer;