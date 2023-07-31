import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryID, Event, EventDetails, EventsState } from '../../../../types/v0';
import { RootState } from '../../store';
import { DateYMDHelpers } from '../../../DateYMD';

export const eventsSlice = createSlice({
    name: 'events',
    initialState: [] as EventsState,
    reducers: {
        add(state, action: PayloadAction<{event: Event}>) {
            state.push(action.payload.event);
        },
        remove(state, action: PayloadAction<{eventID: string}>) {
            // This will remove ALL events matching the provided id
            for (let i = 0; i < state.length; i++) {
                const event = state[i];

                if (event.id === action.payload.eventID) {
                    state.splice(i, 1);
                    i--;
                }
            }
        },
        edit(state, action: PayloadAction<{ eventID: string, newDetails: EventDetails}>) {
            const eventIndex = state.findIndex(item => item.id === action.payload.eventID);
            if (eventIndex === -1) {
                console.error(`eventsSlice -> editEvent: Could not find event index`);
                return;
            }

            state[eventIndex] = {
                ...state[eventIndex],
                details: action.payload.newDetails,
            }
        },
        toggleComplete(state, action: PayloadAction<{eventID: string}>) {
            const eventIndex = state.findIndex(item => item.id === action.payload.eventID);
            if (eventIndex === -1) {
                console.error(`eventsSlice -> toggleEventComplete: Could not find event index`);
                return;
            }

            state[eventIndex].completed = !state[eventIndex].completed;
        },
        removeCategory(state, action: PayloadAction<{ categoryID: CategoryID }>) {
            for (let i = 0; i < state.length; i++) {
                if (state[i].details.categoryID === action.payload.categoryID) {
                    state[i].details.categoryID = null;
                }
            }
        },
        setCategoryID(state, action: PayloadAction<{ eventID: string, categoryID: CategoryID }>) {
            const editedEvent = state.find(item => item.id === action.payload.eventID);
            if (!editedEvent) {
                console.warn('eventsSlice -> setCategory: could not find event matching id');
                return;
            }

            editedEvent.details.categoryID = action.payload.categoryID;
        }
    },
});

export function selectEventFromID(eventID: string) {
    return ((state: RootState) => state.events.find(item => item.id === eventID)?.details)
}

export function getEventFromID(events: EventsState, eventID: string) {
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