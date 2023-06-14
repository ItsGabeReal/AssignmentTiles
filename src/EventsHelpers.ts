import { CategoryID, Event } from "../types/EventTypes";
import DateYMD from "./DateYMD";

export type EventsReducerAction =
    | { type: 'add-event', event: Event }
    | { type: 'remove-event', eventID: string }
    | { type: 'edit-event', eventID: string, name?: string, completed?: boolean, categoryID?: CategoryID, dueDate?: DateYMD }
    | { type: 'toggle-event-complete', eventID: string }
    | { type: 'remove-category', categoryID: string };

export function eventsReducer(state: Event[], action: EventsReducerAction) {
    if (action.type == 'add-event') {
        const { event } = action;

        const outputEvents = deepCopyEvents(state);
        outputEvents.push(event);
        return outputEvents;
    }
    else if (action.type == 'remove-event') {
        const { eventID } = action;

        const outputEvents = deepCopyEvents(state);

        for (let i = 0; i < outputEvents.length; i++) {
            const event = outputEvents[i];
            if (event.id == eventID) {
                outputEvents.splice(i, 1);
                break;
            }
        }

        return outputEvents;
    }
    else if (action.type == 'edit-event') {
        const { eventID, name, completed, categoryID, dueDate } = action;

        const outputEvents = deepCopyEvents(state);
        const event = getEventFromID(outputEvents, eventID);
        if (!event) {
            console.error(`EventsHelpers -> eventsReducer -> edit-event: Could not find event`);
            return state;
        }

        const prevEventDetails = event.details;
        const newCategoryID = categoryID === undefined ? prevEventDetails.categoryID : categoryID;
        outputEvents[event.eventsIndex] = {
            name: name || prevEventDetails.name,
            completed: completed === undefined ? prevEventDetails.completed : completed,
            categoryID: newCategoryID,
            dueDate: dueDate || prevEventDetails.dueDate,
            id: prevEventDetails.id,
        }

        return outputEvents;
    }
    else if (action.type == 'toggle-event-complete') {
        const { eventID } = action;

        const outputEvents = deepCopyEvents(state);

        const event = getEventFromID(outputEvents, eventID);
        if (!event) {
            console.error(`EventsHelpers -> eventsReducer -> toggle-event-complete: Could not find event`);
            return state;
        }

        outputEvents[event.eventsIndex].completed = !outputEvents[event.eventsIndex].completed;

        return outputEvents;
    }
    else if (action.type == 'remove-category') {
        const { categoryID } = action;

        const outputEvents = deepCopyEvents(state);

        for (let i = 0; i < outputEvents.length; i++) {
            const event = outputEvents[i];
            if (event.categoryID === categoryID) event.categoryID = null;
        }

        return outputEvents;
    }
    else return state;
}

function deepCopyEvents(events: Event[]) {
    const outputEvents: Event[] = [];
    events.forEach(item => outputEvents.push({...item}));
    return outputEvents;
}

export function getEventFromID(events: Event[], eventID: string) {
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
        && eventA.name == eventB.name
        && eventA.dueDate == eventB.dueDate
        && eventA.categoryID == eventB.categoryID;
}