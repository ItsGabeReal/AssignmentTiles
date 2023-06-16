import { Category, Event, RowPlan } from "../types/EventTypes";
import DateYMD, { DateYMDHelpers } from "./DateYMD";

export const testCategories: Category[] = [
    {
        name: 'Discrete Logic',
        color: '#48f',
        id: 'logic',
    },
    {
        name: 'Calculus 2',
        color: '#4f4',
        id: 'calc',
    },
    {
        name: 'Mechanics',
        color: '#ff4',
        id: 'mech',
    },
];

export const testEvents: Event[] = [
    {
        name: 'Class',
        completed: false,
        id: Math.random().toString(),
        dueDate: DateYMDHelpers.today(),
        categoryID: testCategories[2].id,
    },
    {
        name: 'Quiz',
        completed: false,
        id: Math.random().toString(),
        dueDate: DateYMDHelpers.today(),
        categoryID: null,
    },
    {
        name: 'Homework',
        completed: false,
        id: Math.random().toString(),
        dueDate: DateYMDHelpers.today(),
        categoryID: testCategories[1].id,
    },
    {
        name: 'Discussion Response',
        completed: false,
        id: Math.random().toString(),
        dueDate: DateYMDHelpers.today(),
        categoryID: testCategories[0].id,
    },
    {
        name: 'Discussion Replies',
        completed: false,
        id: Math.random().toString(),
        dueDate: DateYMDHelpers.today(),
        categoryID: testCategories[1].id,
    },
];

export const testRowPlans: RowPlan[] = [
    {
        plannedDate: DateYMDHelpers.today(),
        orderedEventIDs: [
            testEvents[0].id,
            testEvents[1].id,
            testEvents[2].id,
            testEvents[3].id,
            testEvents[4].id,
        ],
    },
];