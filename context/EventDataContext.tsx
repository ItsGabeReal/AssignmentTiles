import React, { useReducer, useRef, useEffect } from 'react';
import DateYMD from '../src/DateYMD';
import { EventDataReducerAction, eventDataReducer } from '../src/EventDataHelpers';
import { RowEvents } from '../types/EventTypes';

const testEventData: RowEvents[] = [
    {
        date: DateYMD.today(),
        events: [
            {
                name: 'Class',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
                categoryID: 'mech',
            },
            {
                name: 'Quiz',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
            },
            {
                name: 'Homework',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
                categoryID: 'calc',
            },
            {
                name: 'Discussion Response',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
                categoryID: 'logic',
            },
            {
                name: 'Discussion Replies',
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.today(),
                categoryID: 'calc',
            },
        ],
    },
];

type EventDataContextType = {
    state: RowEvents[],
    dispatch: React.Dispatch<EventDataReducerAction>;
    closureSafeRef: React.MutableRefObject<RowEvents[]>;
}

const defaultContextState: EventDataContextType = {
    state: [],
    dispatch: () => console.error('empty event data dispatch'),
    closureSafeRef: { current: [] },
}

const EventDataContext = React.createContext<EventDataContextType>(defaultContextState);

type EventDataContextProviderProps = {
    children?: React.ReactNode;
}

export const EventDataContextProvider: React.FC<EventDataContextProviderProps> = (props) => {
    const [eventData, eventDataDispatch] = useReducer(eventDataReducer, testEventData);

    const eventData_closureSafeRef = useRef(eventData);

    useEffect(() => {
        eventData_closureSafeRef.current = eventData;
    }, [eventData]);

    return (
        <EventDataContext.Provider value={{ state: eventData, dispatch: eventDataDispatch, closureSafeRef: eventData_closureSafeRef }}>
            {props.children}
        </EventDataContext.Provider>
    );
}

export default EventDataContext;