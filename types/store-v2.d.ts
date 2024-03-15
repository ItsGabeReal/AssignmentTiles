/**
 * Defines version 2 of the app's persisted data.
 * 
 * If any breaking changes are made to the root state:
 *      1. Add changes to a new version file
 *      2. Update store-current.d.ts to provide the new file
 *      3. Update the version number in store.ts
 *      4. Create a migration function in migration.ts to translate data to the new version
 */

import { RGBAColor } from "../src/helpers/ColorHelpers";
import DateYMD from "../src/DateYMD";


// ==================== PERSISTED STATE: Edits require new version file ====================

// ----- CATEGORIES -----
export type Category = {
    name: string;
    color: RGBAColor;
}

export type CategoriesState = {
    current: {[key: string]: Category};
    backup: {[key: string]: Category} | null;
}

// ----- EVENTS -----
export interface EventDetails {
    name: string;
    categoryID: string | null;
    dueDate: DateYMD | null;
    notes: string;
}

export interface Event {
    details: EventDetails; // Details are encapsulated so that repeating events might be able to share details in the future
    completed: boolean;
}

export type EventsState = {
    current: {[key: string]: Event};
    backup: {[key: string]: Event} | null;
}

// ----- ROW PLANS -----
export interface RowPlan {
    plannedDate: DateYMD;
    orderedEventIDs: string[];
}

export type RowPlansState = {
    current: {[key: string]: RowPlan};
    backup: {[key: string]: RowPlan} | null;
}


// ==================== NON-PERSISTED STATE: Edits do not require new version file ====================

// ----- GENERAL -----
export type GeneralState = {
    memorizedEventInput: {
        name: string;
        categoryID: string | null;
        deadlineEnabled: boolean;
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
    rowPlans: RowPlansState;
    general: GeneralState;
    visibleDays: VisibleDaysState;
}
