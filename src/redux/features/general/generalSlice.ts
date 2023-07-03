/**
 * A slice for random non-persisted states throughout the app.
 */

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CategoryID, GeneralState } from "../../../../types/v0";

const initialState: GeneralState = {
    memorizedEventInput: {
        name: '',
        categoryID: null,
    },
    draggedEvent: null,
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
        }
    },
});

export const generalStateActions = generalSlice.actions;

export default generalSlice.reducer;