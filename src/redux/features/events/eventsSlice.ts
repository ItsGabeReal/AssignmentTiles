import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryID, DueDate, Event, EventDetails, EventsState } from '../../../../types/store-current';
import { RootState } from '../../store';
import { DateYMDHelpers } from '../../../DateYMD';

const initialState: EventsState = {
    current: [],
    backup: null,
}

export const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        add(state, action: PayloadAction<{event: Event}>) {
            state.current.push(action.payload.event);
        },
        /**
         * Note: Removing and backing up are combined to ensure that the
         * state is backed up before anything is deleted.
         */
        removeAndBackup(state, action: PayloadAction<{eventID: string}>) {
            state.backup = deepCopyEvents(state.current);

            // This will remove ALL events matching the provided id
            for (let i = 0; i < state.current.length; i++) {
                const event = state.current[i];

                if (event.id === action.payload.eventID) {
                    state.current.splice(i, 1);
                    i--;
                }
            }
        },
        removeMultipleAndBackup(state, action: PayloadAction<{ eventIDs: string[] }>) {
            state.backup = deepCopyEvents(state.current);

            action.payload.eventIDs.forEach(id => {
                // This will remove ALL events matching the provided id
                for (let i = 0; i < state.current.length; i++) {
                    const event = state.current[i];

                    if (event.id === id) {
                        state.current.splice(i, 1);
                        i--;
                    }
                }
            });
        },
        edit(state, action: PayloadAction<{ eventID: string, newDetails: EventDetails}>) {
            const eventIndex = state.current.findIndex(item => item.id === action.payload.eventID);
            if (eventIndex === -1) {
                console.error(`eventsSlice -> editEvent: Could not find event index`);
                return;
            }

            state.current[eventIndex] = {
                ...state.current[eventIndex],
                details: action.payload.newDetails,
            }
        },
        toggleComplete(state, action: PayloadAction<{eventID: string}>) {
            const eventIndex = state.current.findIndex(item => item.id === action.payload.eventID);
            if (eventIndex === -1) {
                console.error(`eventsSlice -> toggleEventComplete: Could not find event index`);
                return;
            }

            state.current[eventIndex].completed = !state.current[eventIndex].completed;
        },
        removeCategoryAndBackup(state, action: PayloadAction<{ categoryID: CategoryID }>) {
            state.backup = deepCopyEvents(state.current);
            
            for (let i = 0; i < state.current.length; i++) {
                if (state.current[i].details.categoryID === action.payload.categoryID) {
                    state.current[i].details.categoryID = null;
                }
            }
        },
        setCategoryID(state, action: PayloadAction<{ eventID: string, categoryID: CategoryID }>) {
            const editedEvent = state.current.find(item => item.id === action.payload.eventID);
            if (!editedEvent) {
                console.warn('eventsSlice -> setCategory: could not find event matching id');
                return;
            }

            editedEvent.details.categoryID = action.payload.categoryID;
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

function deepCopyEvents(events: Event[]) {
    const output: Event[] = [];

    events.forEach(event => {
        /**
         * All objects must be coppied, which includes the due date (unless
         * it's null), event details, and the event itself.
         */
        const dueDateCopy: DueDate = event.details.dueDate ? {...event.details.dueDate} : null;

        const eventDetailsCopy: EventDetails = {
            ...event.details,
            dueDate: dueDateCopy,
        }

        output.push({
            ...event,
            details: eventDetailsCopy,
        });
    });

    return output;
}

export function selectEventFromID(eventID: string) {
    return ((state: RootState) => state.events.current.find(item => item.id === eventID)?.details)
}

export function getEventFromID(events: Event[], eventID: string) {
    for (let i = 0; i < events.length; i++) {
        if (events[i].id == eventID) {
            return {
                details: events[i],
                eventsIndex: i,
            }
        }
    }

    return undefined;
}

export function areEventsEqual(eventA: Event, eventB: Event) {
    return eventA.id === eventB.id
        && eventA.completed === eventB.completed
        && eventA.details.name === eventB.details.name
        && DateYMDHelpers.datesEqual(eventA.details.dueDate, eventB.details.dueDate)
        && eventA.details.categoryID === eventB.details.categoryID
        && eventA.details.notes === eventB.details.notes;
}

export const eventActions = eventsSlice.actions;

export default eventsSlice.reducer;