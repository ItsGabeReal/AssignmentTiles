import { EventsOnDate, Event } from "../types/EventTypes";
import DateYMD from "./DateYMD";

export type RowEventsReducerAction =
    | { type: 'insert-event', eventID: string, plannedDate: DateYMD, insertionIndex?: number }
    | { type: 'remove-event', eventID: string }
    | { type: 'move-event', eventID: string, plannedDate: DateYMD, insertionIndex?: number };

export function rowEventsReducer(state: EventsOnDate[], action: RowEventsReducerAction) {
    const insertEvent = (rowEvents: EventsOnDate[], eventID: string, plannedDate: DateYMD, insertionIndex?: number) => {
        const outputRowEvents = deepCopyRowEvents(rowEvents);

        const eventsOnDate = getEventsOnDate(outputRowEvents, plannedDate);
        if (eventsOnDate) {
            const actualInsertionIndex = insertionIndex == undefined ? eventsOnDate.orderedEventIDs.length : insertionIndex;
            eventsOnDate.orderedEventIDs.splice(actualInsertionIndex, 0, eventID);
        }
        else {
            outputRowEvents.push({ plannedDate, orderedEventIDs: [eventID] });
            sortRowEventsByDate(outputRowEvents);
        }

        return outputRowEvents;
    }
    
    const removeEvent = (rowEvents: EventsOnDate[], eventID: string): { outputRowEvents: EventsOnDate[], removedFromDate: DateYMD, removedFromIndex: number } | undefined => { 
        const outputRowEvents = deepCopyRowEvents(rowEvents); // <- REPLACE THIS WITH structuredClone IF IT BECOMES AVAILABLE

        let removedFromIndex = -1;
        let removedFromDate: DateYMD | null = null;
        for (let i = 0; i < outputRowEvents.length; i++) {
            const eventsOnDate = outputRowEvents[i];

            for (let j = 0; j < eventsOnDate.orderedEventIDs.length; j++) {
                if (eventsOnDate.orderedEventIDs[j] == eventID) {
                    eventsOnDate.orderedEventIDs.splice(j, 1);
                    removedFromIndex = j;
                    removedFromDate = eventsOnDate.plannedDate;
                    break;
                }
            }

            // Remove rowEvents element if there arent any more events in it
            const eventWasRemoved = removedFromIndex != -1;
            if (eventWasRemoved) {
                if (eventsOnDate.orderedEventIDs.length == 0) {
                    outputRowEvents.splice(i, 1);
                }
                break;
            }
        }

        if (removedFromIndex == -1 || removedFromDate == null) {
            return undefined;
        }

        return {
            outputRowEvents: outputRowEvents,
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
            console.error(`RowEventsHelpers -> rowEventsReducer -> remove-event: Could  not remove event`);
            return state;
        }

        return removeEventOutput.outputRowEvents;
    }
    else if (action.type == 'move-event') {
        const { eventID, plannedDate, insertionIndex } = action;

        // Find event
        const eventPlan = getEventPlan(state, eventID);
        if (!eventPlan) {
            console.error('RowEventsHelpers -> rowEventsReducer -> move-event: Could not find event');
            return state;
        }

        // Get actual insertion index
        let actualInsertionIndex;
        if (insertionIndex == undefined) {
            // Get the number of events aleady in the target row
            const eventsOnTargetDate = getEventsOnDate(state, plannedDate);
            
            const eventsOnDateExists = eventsOnTargetDate != undefined;
            actualInsertionIndex = eventsOnDateExists ? eventsOnTargetDate.orderedEventIDs.length : 0;
        }
        else {
            actualInsertionIndex = insertionIndex;
        }

        // Remove event
        const removeEventOutput = removeEvent(state, eventID);
        if (!removeEventOutput) {
            console.error(`RowEventsHelpers -> rowEventsReducer -> move-event: Could not remove event`);
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
        const outputRowEvents = insertEvent(removeEventOutput.outputRowEvents, eventID, plannedDate, actualInsertionIndex);
        
        return outputRowEvents;
    }
    else return state;
}

function deepCopyRowEvents(rowEvents: EventsOnDate[]) {
    const outputRowEvents: EventsOnDate[] = [];

    for (let i = 0; i < rowEvents.length; i++) {
        const eventIDs = [...rowEvents[i].orderedEventIDs];

        outputRowEvents.push({
            plannedDate: rowEvents[i].plannedDate,
            orderedEventIDs: eventIDs,
        });
    }

    return outputRowEvents;
}

export function getEventsOnDate(rowEvents: EventsOnDate[], plannedDate: DateYMD) {
    return rowEvents.find(item => item.plannedDate.equals(plannedDate));
}

function sortRowEventsByDate(rowEvents: EventsOnDate[]) {
    rowEvents.sort((a, b) => (a.plannedDate.toDate().valueOf() - b.plannedDate.toDate().valueOf()));
}

export function getEventPlan(rowEvents: EventsOnDate[], eventID: string) {
    for (let i = 0; i < rowEvents.length; i++) {
        const orderedEventIDs = rowEvents[i].orderedEventIDs;

        for (let j = 0; j < orderedEventIDs.length; j++) {
            if (orderedEventIDs[j] === eventID) {
                return {
                    plannedDate: rowEvents[i].plannedDate,
                    rowEventsIndex: i,
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