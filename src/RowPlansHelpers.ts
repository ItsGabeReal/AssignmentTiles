import { RowPlan, Event } from "../types/EventTypes";
import DateYMD from "./DateYMD";

export type RowPlansReducerAction =
    | { type: 'insert-event', eventID: string, plannedDate: DateYMD, insertionIndex?: number }
    | { type: 'remove-event', eventID: string }
    | { type: 'move-event', eventID: string, plannedDate: DateYMD, insertionIndex?: number };

export function rowPlansReducer(state: RowPlan[], action: RowPlansReducerAction) {
    const insertEvent = (rowPlans: RowPlan[], eventID: string, plannedDate: DateYMD, insertionIndex?: number) => {
        const outputRowPlans = deepCopyRowPlans(rowPlans);

        const rowPlan = getRowPlan(outputRowPlans, plannedDate);
        if (rowPlan) {
            const actualInsertionIndex = insertionIndex == undefined ? rowPlan.orderedEventIDs.length : insertionIndex;
            rowPlan.orderedEventIDs.splice(actualInsertionIndex, 0, eventID);
        }
        else {
            outputRowPlans.push({ plannedDate, orderedEventIDs: [eventID] });
            sortRowPlansByDate(outputRowPlans);
        }

        return outputRowPlans;
    }
    
    const removeEvent = (rowPlans: RowPlan[], eventID: string): { outputRowPlans: RowPlan[], removedFromDate: DateYMD, removedFromIndex: number } | undefined => { 
        const outputRowPlans = deepCopyRowPlans(rowPlans); // <- REPLACE THIS WITH structuredClone IF IT BECOMES AVAILABLE

        let removedFromIndex = -1;
        let removedFromDate: DateYMD | null = null;
        for (let i = 0; i < outputRowPlans.length; i++) {
            const rowPlan = outputRowPlans[i];

            for (let j = 0; j < rowPlan.orderedEventIDs.length; j++) {
                if (rowPlan.orderedEventIDs[j] == eventID) {
                    rowPlan.orderedEventIDs.splice(j, 1);
                    removedFromIndex = j;
                    removedFromDate = rowPlan.plannedDate;
                    break;
                }
            }

            // Remove rowPlans element if there arent any more events in it
            const eventWasRemoved = removedFromIndex != -1;
            if (eventWasRemoved) {
                if (rowPlan.orderedEventIDs.length == 0) {
                    outputRowPlans.splice(i, 1);
                }
                break;
            }
        }

        if (removedFromIndex == -1 || removedFromDate == null) {
            return undefined;
        }

        return {
            outputRowPlans: outputRowPlans,
            removedFromDate: removedFromDate,
            removedFromIndex: removedFromIndex,
        };
    }

    if (action.type == 'insert-event') {
        const { eventID, plannedDate, insertionIndex } = action;

        return insertEvent(state, eventID, plannedDate, insertionIndex);
    }
    else if (action.type == 'remove-event') {
        const { eventID } = action;
        
        const removeEventOutput = removeEvent(state, eventID);
        if (!removeEventOutput) {
            console.error(`RowPlansHelpers -> rowPlansReducer -> remove-event: Could  not remove event`);
            return state;
        }

        return removeEventOutput.outputRowPlans;
    }
    else if (action.type == 'move-event') {
        const { eventID, plannedDate, insertionIndex } = action;

        // Find event
        const eventPlan = getEventPlan(state, eventID);
        if (!eventPlan) {
            console.error('RowPlansHelpers -> rowPlansReducer -> move-event: Could not find event');
            return state;
        }

        // Get actual insertion index
        let actualInsertionIndex;
        if (insertionIndex == undefined) {
            // Get the number of events aleady in the target row
            const eventsOnTargetDate = getRowPlan(state, plannedDate);
            
            const rowPlanExists = eventsOnTargetDate != undefined;
            actualInsertionIndex = rowPlanExists ? eventsOnTargetDate.orderedEventIDs.length : 0;
        }
        else {
            actualInsertionIndex = insertionIndex;
        }

        // Remove event
        const removeEventOutput = removeEvent(state, eventID);
        if (!removeEventOutput) {
            console.error(`RowPlansHelpers -> rowPlansReducer -> move-event: Could not remove event`);
            return state;
        }

        // Decrement actual insertion index if necessary
        const eventMovedToSameDate = removeEventOutput.removedFromDate.equals(plannedDate);
        if (eventMovedToSameDate) {
            const eventRemovedBeforeInsertionIndex = removeEventOutput.removedFromIndex < actualInsertionIndex;
            if (eventRemovedBeforeInsertionIndex) {
                actualInsertionIndex--;
            }
        }

        // Add event back in
        const outputRowPlans = insertEvent(removeEventOutput.outputRowPlans, eventID, plannedDate, actualInsertionIndex);
        
        return outputRowPlans;
    }
    else return state;
}

function deepCopyRowPlans(rowPlans: RowPlan[]) {
    const outputRowPlans: RowPlan[] = [];

    for (let i = 0; i < rowPlans.length; i++) {
        const eventIDs = [...rowPlans[i].orderedEventIDs];

        outputRowPlans.push({
            plannedDate: rowPlans[i].plannedDate,
            orderedEventIDs: eventIDs,
        });
    }

    return outputRowPlans;
}

export function getRowPlan(rowPlans: RowPlan[], plannedDate: DateYMD) {
    return rowPlans.find(item => item.plannedDate.equals(plannedDate));
}

function sortRowPlansByDate(rowPlans: RowPlan[]) {
    rowPlans.sort((a, b) => (a.plannedDate.toDate().valueOf() - b.plannedDate.toDate().valueOf()));
}

export function getEventPlan(rowPlans: RowPlan[], eventID: string) {
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

export function getInitialPlannedDateForEvent(event: Event) {
    if (event.dueDate) {
        return event.dueDate;
    }
    else {
        return DateYMD.today();
    }
}