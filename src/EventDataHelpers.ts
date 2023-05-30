import { EventDetails, RowEvents } from "../types/EventTypes";
import DateYMD from "./DateYMD";

export type EventTileDimensions = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type EventDataReducerAction =
    | { type: 'add', newEvent: EventDetails }
    | { type: 'remove', eventID: string }
    | { type: 'change-planned-date', eventID: string, newPlannedDate: DateYMD, insertionIndex?: number }
    | { type: 'set-event-details', targetEventID: string, newEventDetails: EventDetails };

export function eventDataReducer(state: RowEvents[], action: EventDataReducerAction) {
    const getInitialPlannedDateFromEventDetails = (eventDetails: EventDetails) => { // TESTING REQUIRED
        if (eventDetails.dueDate) {
            return eventDetails.dueDate;
        }
        else {
            return DateYMD.today();
        }
    }

    const sortEventDataByDate = (eventData: RowEvents[]) => {
        eventData.sort((itemA, itemB) => itemA.date.toDate().valueOf() - itemB.date.toDate().valueOf());
    }

    const addEvent = (eventData: RowEvents[], event: EventDetails, plannedDate: DateYMD, insertionIndex?: number) => {
        const outputEventData = [...eventData];

        const targetRowEvents = getRowEventsFromDate(outputEventData, plannedDate);
        if (targetRowEvents) {
            const actualInsertionIndex = insertionIndex == undefined ? targetRowEvents.events.length : insertionIndex;
            targetRowEvents.events.splice(actualInsertionIndex, 0, event);
        }
        else {
            outputEventData.push({ date: plannedDate, events: [event] });
            sortEventDataByDate(outputEventData);
        }

        return outputEventData;
    }

    const removeEvent = (eventData: RowEvents[], eventID: string) => { // TEST TO MAKE SURE MULTIPLE INSTANCES OF THE SAME EVENT ARE REMOVED
        const outputEventData = [...eventData];

        let removedFromIndex = -1;
        let removedFromDate: DateYMD | null = null;
        for (let i = 0; i < outputEventData.length; i++) {
            const rowEvents = outputEventData[i];

            for (let j = 0; j < rowEvents.events.length; j++) {
                const event = rowEvents.events[j];
                if (event.id == eventID) {
                    rowEvents.events.splice(j, 1);
                    removedFromIndex = j;
                    removedFromDate = rowEvents.date;
                    break;
                }
            }
            
            // Remove eventData element if there arent any more events in it
            const eventWasRemoved = removedFromIndex != -1;
            if (eventWasRemoved) {
                if (rowEvents.events.length == 0) {
                    outputEventData.splice(i, 1);
                }
                break;
            }
        }

        if (removedFromIndex == -1 || removedFromDate == null) {
            return null;
        }

        return {
            outputEventData: outputEventData,
            removedFromDate: removedFromDate,
            removedFromIndex: removedFromIndex,
        };
    }

    if (action.type == 'add') {
        const { newEvent } = action;

        const initialPlannedDate = getInitialPlannedDateFromEventDetails(newEvent);
        const eventDataWithNewEvent = addEvent(state, newEvent, initialPlannedDate);

        return eventDataWithNewEvent;
    }
    else if (action.type == 'remove') {
        const { eventID } = action;

        const removeEventOutput = removeEvent(state, eventID);
        if (!removeEventOutput) {
            console.error(`remove: Could not remove event with id = ${eventID}`);
            return state;
        }

        return removeEventOutput.outputEventData;
    }
    else if (action.type == 'change-planned-date') {
        const { eventID, newPlannedDate, insertionIndex } = action;

        // Find event
        const event = getEventFromID(state, eventID);
        if (!event) {
            console.error(`Could not find event with id = ${eventID}`);
            return state;
        }

        // Get actual insertion index
        let actualInsertionIndex;
        if (insertionIndex == undefined) {
            const newRowEvents = getRowEventsFromDate(state, newPlannedDate);
            const rowEventsExists = newRowEvents != undefined;

            actualInsertionIndex = rowEventsExists ? newRowEvents.events.length : 0;
        }
        else {
            actualInsertionIndex = insertionIndex;
        }

        // Remove event
        const removeEventOutput = removeEvent(state, eventID);
        if (!removeEventOutput) {
            console.error(`change-planned-date: Could not remove event with id = ${eventID}`);
            return state;
        }

        // Decrement actual insertion index if necessary
        const eventMovedToSameDate = removeEventOutput.removedFromDate.equals(newPlannedDate);
        if (eventMovedToSameDate) {
            const eventRemovedBeforeInsertionIndex = removeEventOutput.removedFromIndex < actualInsertionIndex;
            if (eventRemovedBeforeInsertionIndex) {
                actualInsertionIndex--;
            }
        }

        // Add event back in
        const outputEventData = addEvent(removeEventOutput.outputEventData, event.details, newPlannedDate, actualInsertionIndex);

        return outputEventData;
    }
    else if (action.type == 'set-event-details') {
        const { targetEventID, newEventDetails } = action;
        
        const outputEventData = [...state];
        const event = getEventFromID(outputEventData, targetEventID);

        if (!event) {
            console.error(`eventDataReducer -> set-event-details: Could not find event with id = ${targetEventID}`);
            return state;
        }
        
        outputEventData[event.eventDataIndex].events[event.rowOrder] = newEventDetails;
        return outputEventData;
    }
    else return state;
}

export function getRowEventsFromDate(eventData: RowEvents[], date: DateYMD) {
    return eventData.find(item => item.date.equals(date));
}

export function getEventFromID(eventData: RowEvents[], eventID: string) {
    for (let i = 0; i < eventData.length; i++) {
        const rowEvents = eventData[i];
        for (let j = 0; j < rowEvents.events.length; j++) {
            const eventDetails = rowEvents.events[j];
            if (eventDetails.id == eventID) {
                return {
                    details: eventDetails,
                    plannedDate: rowEvents.date,
                    eventDataIndex: i,
                    rowOrder: j,
                }
            }
        }
    }
}

export function printEventData(eventData: RowEvents[]) {
    for (let i = 0; i < eventData.length; i++) {
        let eventArrayString = '[';
        for (let j = 0; j < eventData[i].events.length; j++) {
            if (j > 0) eventArrayString += ', ';
            const event = eventData[i].events[j];
            eventArrayString += event.name;
        }
        eventArrayString += ']';

        console.log(`${eventData[i].date.toString()}: ${eventArrayString}`);
    }
}