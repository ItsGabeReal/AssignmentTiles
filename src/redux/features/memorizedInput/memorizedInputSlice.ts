import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CategoryID, MemorizedInputState } from "../../../../types/v0";

const initialState: MemorizedInputState = {
    eventInput: {
        name: '',
        categoryID: null,
    }
};

export const memorizedInputSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        updateMemorizedEventInput(state, action: PayloadAction<{name?: string, categoryID?: CategoryID}>) {
            state.eventInput = {
                name: action.payload.name || state.eventInput.name,
                categoryID: action.payload.categoryID !== undefined ? action.payload.categoryID : state.eventInput.categoryID,
            }
        }
    },
});

export const memorizedInputActions = memorizedInputSlice.actions;

export default memorizedInputSlice.reducer;