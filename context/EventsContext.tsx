import React, { useReducer, useRef, useEffect } from 'react';
import { EventsReducerAction, eventsReducer } from '../src/EventsHelpers';
import { Event } from '../types/EventTypes';
import { testEvents } from '../src/TestData';

type EventsContextType = {
    state: Event[],
    dispatch: React.Dispatch<EventsReducerAction>;
    closureSafeRef: React.MutableRefObject<Event[]>;
}

const defaultContextState: EventsContextType = {
    state: [],
    dispatch: () => console.error('empty events dispatch'),
    closureSafeRef: { current: [] },
}

const EventsContext = React.createContext<EventsContextType>(defaultContextState);

type eventsContextProviderProps = {
    children?: React.ReactNode;
}

export const EventsContextProvider: React.FC<eventsContextProviderProps> = (props) => {
    const [events, eventsDispatch] = useReducer(eventsReducer, testEvents);

    const events_closureSafeRef = useRef(events);

    useEffect(() => {
        events_closureSafeRef.current = events;
    }, [events]);

    return (
        <EventsContext.Provider value={{ state: events, dispatch: eventsDispatch, closureSafeRef: events_closureSafeRef }}>
            {props.children}
        </EventsContext.Provider>
    );
}

export default EventsContext;