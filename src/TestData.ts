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
        details: {
            name: 'Class',
            categoryID: testCategories[2].id,
            dueDate: DateYMDHelpers.today(),
        },
        completed: false,
        id: Math.random().toString(),
    },
    {
        details: {
            name: 'Quiz',
            categoryID: null,
            dueDate: DateYMDHelpers.today(),
        },
        completed: false,
        id: Math.random().toString(),
    },
    {
        details: {
            name: 'Homework',
            categoryID: testCategories[1].id,
            dueDate: DateYMDHelpers.today(),
        },
        completed: false,
        id: Math.random().toString(),
    },
    {
        details: {
            name: 'Discussion Response',
            categoryID: testCategories[0].id,
            dueDate: DateYMDHelpers.today(),
        },
        completed: false,
        id: Math.random().toString(),
    },
    {
        details: {
            name: 'Discussion Replies',
            categoryID: testCategories[1].id,
            dueDate: DateYMDHelpers.today(),
        },
        completed: false,
        id: Math.random().toString(),
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