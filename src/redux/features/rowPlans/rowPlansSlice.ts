import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventDetails, RowPlan, RowPlansState } from "../../../../types/store-current";
import DateYMD, { DateYMDHelpers } from '../../../DateYMD';

const initialState: RowPlansState = {
    current: {},
    backup: null,
}

export const rowPlansSlice = createSlice({
    name: 'rowPlans',
    initialState,
    reducers: {
        insertEvent(state, action: PayloadAction<{eventID: string, plannedDate: DateYMD, insertionIndex?: number}>) {
            _insertEventInRowPlans(
                state.current,
                action.payload.eventID,
                action.payload.plannedDate,
                action.payload.insertionIndex
            );
        },
        removeEventAndBackup(state, action: PayloadAction<{eventID: string}>) {
            state.backup = deepCopyRowPlans(state.current);

            _removeEventFromRowPlans(state.current, action.payload.eventID);
        },
        removeMultipleEventsAndBackup(state, action: PayloadAction<{ eventIDs: string[] }>) {
            state.backup = deepCopyRowPlans(state.current);

            action.payload.eventIDs.forEach(id => {
                _removeEventFromRowPlans(state.current, id);
            });
        },
        changePlannedDate(state, action: PayloadAction<{eventID: string, plannedDate: DateYMD, insertionIndex?: number}>) {
            const { eventID, plannedDate, insertionIndex } = action.payload;

            _removeEventFromRowPlans(state.current, eventID);

            _insertEventInRowPlans(
                state.current,
                eventID,
                plannedDate,
                insertionIndex
            );
        },
        restoreBackup(state) {
            if (!state.backup) {
                console.warn('rowPlansSlice -> restoreBackup: No backup to restore. Be sure to call "backup" first.');
                return;
            }
            
            state.current = deepCopyRowPlans(state.backup);
        },
    }
});

// Inserts event into an existing row plan, or creates a new row plan if it doesn't exist
function _insertEventInRowPlans(rowPlans: {[key: string]: RowPlan}, eventID: string, plannedDate: DateYMD, insertionIndex?: number) {    
    const key = DateYMDHelpers.toString(plannedDate);

    if (key in rowPlans) { // Plan already exists for this date
        const actualInsertionIndex = insertionIndex == undefined ? rowPlans[key].orderedEventIDs.length : insertionIndex;
        rowPlans[key].orderedEventIDs.splice(actualInsertionIndex, 0, eventID);
    }
    else { // Plan does not exist
        rowPlans[key] = {
            plannedDate,
            orderedEventIDs: [eventID]
        }
    }
}

// Mutates rowPlans by removing the provided eventID
function _removeEventFromRowPlans(rowPlans: {[key: string]: RowPlan}, eventID: string) {
    const plan = getEventPlan(rowPlans, eventID);

    if (plan !== undefined) {
        rowPlans[plan.rowPlansKey].orderedEventIDs.splice(plan.rowOrder, 1);

        if (rowPlans[plan.rowPlansKey].orderedEventIDs.length === 0)
            delete rowPlans[plan.rowPlansKey];
    }
}

function deepCopyRowPlans(rowPlans: {[key: string]: RowPlan}) {
    const output: {[key: string]: RowPlan} = {};

    for (let key in rowPlans) {
        const plan = rowPlans[key];

        output[key] = {
            plannedDate: { ...plan.plannedDate },
            orderedEventIDs: [ ...plan.orderedEventIDs ]
        };
    }

    return output;
}

// Returns the key of the row plan this event is in, the date it's planned on, and its order within the row. Returns undefined if the event id isn't found
export function getEventPlan(rowPlans: {[key: string]: RowPlan}, eventID: string) {
    for (let key in rowPlans) {
        const eventIDs = rowPlans[key].orderedEventIDs;

        for (let i = 0; i < eventIDs.length; i++) {
            if (eventIDs[i] === eventID) {
                return {
                    rowPlansKey: key,
                    plannedDate: rowPlans[key].plannedDate,
                    rowOrder: i
                };
            }
        }
    }

    return undefined;
}

// Determines the initial planned date for an event based on its details
export function getInitialPlannedDateForEvent(event: EventDetails) {
    if (event.dueDate) {
        return event.dueDate;
    }
    else {
        return DateYMDHelpers.today();
    }
}

export const rowPlansActions = rowPlansSlice.actions;

export default rowPlansSlice.reducer;