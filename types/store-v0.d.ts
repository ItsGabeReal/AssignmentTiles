/**
 * Defines version 0 of the app's persisted data.
 * 
 * If any breaking changes are made to the root state:
 *      1. Add changes to a new version file
 *      2. Update store-current.d.ts to provide the new file
 *      3. Update the version number in store.ts
 *      4. Create a migration function in migration.ts to translate data to the new version
 */

import { ColorValue } from "react-native";
import DateYMD from "../src/DateYMD";


// ==================== PERSISTED STATE: Edits require new version file ====================

// ----- CATEGORIES -----
export type CategoryID = string | null;

export type Category = {
    name: string;
    color: ColorValue;
    id: CategoryID;
}

export type CategoriesState = Category[];

// ----- EVENTS -----
export type DueDate = DateYMD | null;

export interface EventDetails {
    name: string;
    categoryID: CategoryID;
    dueDate: DueDate;
    notes: string;
}

export interface Event {
    details: EventDetails;
    completed: boolean;
    id: string;
}

export type EventsState = Event[];

// ----- ROW PLANS -----
export interface RowPlan {
    plannedDate: DateYMD;
    orderedEventIDs: string[];
}

export type RowPlansState = RowPlan[];


// ==================== NON-PERSISTED STATE: Edits do not require new version file ====================

// ----- GENERAL -----
export type GeneralState = {
    memorizedEventInput: {
        name: string;
        categoryID: CategoryID;
    };
    draggedEvent: {
        eventID: string;
    } | null;
    multiselect: {
        enabled: boolean;
        selectedEventIDs: string[];
    };
}

// ----- VISIBLE DAYS -----
export type VisibleDaysState = DateYMD[];


/**
 * Used when migrating store versions.
 * Should match the root state in the redux store.
 */
export type RootState = {
    categories: CategoriesState;
    events: EventsState;
    general: GeneralState;
    rowPlans: RowPlansState;
    visibleDays: VisibleDaysState;
}
