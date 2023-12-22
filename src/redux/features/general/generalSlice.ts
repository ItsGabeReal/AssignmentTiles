/**
 * A slice for random non-persisted states throughout the app.
 */

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CategoryID, GeneralState } from "../../../../types/store-current";

const initialState: GeneralState = {
    memorizedEventInput: {
        name: '',
        categoryID: null,
    },
    draggedEvent: null,
    multiselect: {
        enabled: false,
        selectedEventIDs: [],
    },
};

export const generalSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        updateMemorizedEventInput(state, action: PayloadAction<{ name?: string, categoryID?: CategoryID }>) {
            state.memorizedEventInput = {
                name: action.payload.name || state.memorizedEventInput.name,
                categoryID: action.payload.categoryID !== undefined ? action.payload.categoryID : state.memorizedEventInput.categoryID,
            }
        },
        setDraggedEvent(state, action: PayloadAction<{eventID: string}>) {
            state.draggedEvent = {
                eventID: action.payload.eventID,
            }
        },
        clearDraggedEvent(state) {
            state.draggedEvent = null;
        },
        setMultiselectEnabled(state, action: PayloadAction<{enabled: boolean}>) {
            state.multiselect.enabled = action.payload.enabled;

            if (!action.payload.enabled) state.multiselect.selectedEventIDs.length = 0;
        },
        toggleEventIDSelected(state, action: PayloadAction<{eventID: string}>) {
            const indexInSelectedEventIDs = state.multiselect.selectedEventIDs.findIndex(item => item === action.payload.eventID);

            const eventIDIsSelected = indexInSelectedEventIDs !== -1;

            if (eventIDIsSelected) {
                state.multiselect.selectedEventIDs.splice(indexInSelectedEventIDs, 1);
            }
            else {
                state.multiselect.selectedEventIDs.push(action.payload.eventID);
            }
        },
    },
});

export const generalStateActions = generalSlice.actions;

export default generalSlice.reducer;