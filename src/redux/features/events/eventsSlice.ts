import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryID, Event, EventDetails } from '../../../../types/EventTypes';
import { testEvents } from '../../../TestData';
import DateYMD from '../../../DateYMD';

export type EventsState = Event[];

export const eventsSlice = createSlice({
    name: 'events',
    initialState: /*testEvents*/[] as EventsState,
    reducers: {
        addEvent(state, action: PayloadAction<{event: Event}>) {
            state.push(action.payload.event);
        },
        removeEvent(state, action: PayloadAction<{eventID: string}>) {
            // This will remove ALL events matching the provided id
            for (let i = 0; i < state.length; i++) {
                const event = state[i];

                if (event.id === action.payload.eventID) {
                    state.splice(i, 1);
                    i--;
                }
            }
        },
        editEvent(state, action: PayloadAction<{ eventID: string, newDetails: EventDetails}>) {
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
        toggleEventComplete(state, action: PayloadAction<{eventID: string}>) {
            const eventIndex = state.findIndex(item => item.id === action.payload.eventID);
            if (eventIndex === -1) {
                console.error(`eventsSlice -> toggleEventComplete: Could not find event index`);
                return;
            }

            state[eventIndex].completed = !state[eventIndex].completed;
        },
        removeCategoryFromEvents(state, action: PayloadAction<{ categoryID: CategoryID }>) {
            for (let i = 0; i < state.length; i++) {
                if (state[i].details.categoryID === action.payload.categoryID) {
                    state[i].details.categoryID = null;
                }
            }
        },
    },
});

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
    return eventA.id == eventB.id
        && eventA.completed == eventB.completed
        && eventA.details.name == eventB.details.name
        && eventA.details.dueDate == eventB.details.dueDate
        && eventA.details.categoryID == eventB.details.categoryID;
}

export const { addEvent, removeEvent, editEvent, toggleEventComplete, removeCategoryFromEvents } = eventsSlice.actions;

export default eventsSlice.reducer;