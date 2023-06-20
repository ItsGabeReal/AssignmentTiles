import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventDetails, RowPlan } from "../../../../types/EventTypes";
import DateYMD, { DateYMDHelpers } from '../../../DateYMD';

export type RowPlansState = RowPlan[];

export const rowPlansSlice = createSlice({
    name: 'rowPlans',
    initialState: [] as RowPlansState,
    reducers: {
        insertEvent(state, action: PayloadAction<{eventID: string, plannedDate: DateYMD, insertionIndex?: number}>) {
            _insertEventInRowPlans(
                state,
                action.payload.eventID,
                action.payload.plannedDate,
                action.payload.insertionIndex
            );
        },
        removeEvent(state, action: PayloadAction<{eventID: string}>) {
            const removeEventOutput = _removeEventFromRowPlans(state, action.payload.eventID);
            if (!removeEventOutput) {
                console.warn('rowPlansSlice -> removeEventFromRowPlans: Could not remove event because no events match the provided id');
                return;
            }
        },
        changePlannedDate(state, action: PayloadAction<{eventID: string, plannedDate: DateYMD, insertionIndex?: number}>) {
            // Find event
            const eventPlan = getEventPlan(state, action.payload.eventID);
            if (!eventPlan) {
                console.error('rowPlansSlice -> changePlannedDate: Could not find event');
                return;
            }

            // Get actual insertion index
            let actualInsertionIndex;
            if (action.payload.insertionIndex === undefined) {
                // Get the number of events aleady in the target row
                const eventsOnTargetDate = getRowPlan(state, action.payload.plannedDate);

                const rowPlanExists = eventsOnTargetDate != undefined;
                actualInsertionIndex = rowPlanExists ? eventsOnTargetDate.orderedEventIDs.length : 0;
            }
            else {
                actualInsertionIndex = action.payload.insertionIndex;
            }

            // Remove event
            const removeEventOutput = _removeEventFromRowPlans(state, action.payload.eventID);
            if (!removeEventOutput) {
                console.error(`rowPlansSlice -> changePlannedDate: Could not remove event`);
                return;
            }

            // Decrement actual insertion index if necessary
            const eventMovedToSameDate = DateYMDHelpers.datesEqual(removeEventOutput.removedFromDate, action.payload.plannedDate);
            if (eventMovedToSameDate) {
                const eventRemovedBeforeInsertionIndex = removeEventOutput.removedFromIndex < actualInsertionIndex;
                if (eventRemovedBeforeInsertionIndex) {
                    actualInsertionIndex--;
                }
            }

            // Add event back in
            _insertEventInRowPlans(
                state,
                action.payload.eventID,
                action.payload.plannedDate,
                actualInsertionIndex
            );
        }
    }
});

function _insertEventInRowPlans(rowPlans: RowPlansState, eventID: string, plannedDate: DateYMD, insertionIndex?: number) {
    const rowPlan = getRowPlan(rowPlans, plannedDate);
    if (rowPlan) {
        const actualInsertionIndex = insertionIndex == undefined ? rowPlan.orderedEventIDs.length : insertionIndex;
        rowPlan.orderedEventIDs.splice(actualInsertionIndex, 0, eventID);
    }
    else {
        rowPlans.push({ plannedDate, orderedEventIDs: [eventID] });
        sortRowPlansByDate(rowPlans);
    }
}

function _removeEventFromRowPlans(rowPlans: RowPlansState, eventID: string) {
    let removedFromIndex = -1;
    let removedFromDate: DateYMD | null = null;
    for (let i = 0; i < rowPlans.length; i++) {
        const rowPlan = rowPlans[i];

        for (let j = 0; j < rowPlan.orderedEventIDs.length; j++) {
            if (rowPlan.orderedEventIDs[j] === eventID) {
                rowPlan.orderedEventIDs.splice(j, 1);
                removedFromIndex = j;
                removedFromDate = rowPlan.plannedDate;
                break;
            }
        }

        // Remove rowPlans element if there arent any more events in it
        const eventWasRemoved = removedFromIndex != -1;
        if (eventWasRemoved) {
            if (rowPlan.orderedEventIDs.length === 0) {
                rowPlans.splice(i, 1);
            }
            break;
        }
    }

    if (removedFromIndex == -1 || removedFromDate == null) {
        return undefined;
    }

    return {
        removedFromDate: removedFromDate,
        removedFromIndex: removedFromIndex,
    };
}

function sortRowPlansByDate(rowPlans: RowPlansState) {
    rowPlans.sort((a, b) => DateYMDHelpers.toDate(a.plannedDate).valueOf() - DateYMDHelpers.toDate(b.plannedDate).valueOf());
}

export function getRowPlan(rowPlans: RowPlansState, plannedDate: DateYMD) {
    return rowPlans.find(item => DateYMDHelpers.datesEqual(item.plannedDate, plannedDate));
}

export function getEventPlan(rowPlans: RowPlansState, eventID: string) {
    for (let i = 0; i < rowPlans.length; i++) {
        const orderedEventIDs = rowPlans[i].orderedEventIDs;

        for (let j = 0; j < orderedEventIDs.length; j++) {
            if (orderedEventIDs[j] === eventID) {
                return {
                    plannedDate: rowPlans[i].plannedDate,
                    rowPlansIndex: i,
                    rowOrder: j,
                };
            }
        }
    }

    return undefined;
}

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