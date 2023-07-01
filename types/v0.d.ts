/**
 * This defines the types for version 0 of the redux store.
 * 
 * If any of this cud changes, you should:
 *      1. Create a new version file
 *      2. Update all type imports to the new version file
 *      3. Update the version number in store.ts
 *      4. Create a migration function in migration.ts
 */

import DateYMD from "../src/DateYMD";

export interface Event {
    details: EventDetails;
    completed: boolean;
    id: string;
}

export interface EventDetails {
    name: string;
    categoryID: CategoryID;
    dueDate: DateYMD | null;
}

export type EventTileDimensions = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface RowPlan {
    plannedDate: DateYMD;
    orderedEventIDs: string[];
}

export type EventTileCallbacks = {
    onTilePressed?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileLongPressed?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileLongPressRelease?: (() => void);
    onTileDragStart?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileDrag?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileDropped?: ((gesture: GestureResponderEvent, eventID: string) => void);
}

export type CategoryID = string | null;

export type Category = {
    name: string;
    color: ColorValue;
    id: CategoryID;
}

export type CategoriesState = Category[];

export type EventsState = Event[];

export type MemorizedInputState = {
    eventInput: {
        name: string;
        categoryID: CategoryID;
    },
};

export type RowPlansState = RowPlan[];

export type VisibleDaysState = DateYMD[];

/**
 * Used when migrating store versions.
 * Should match the root state in the redux store.
 */
export type RootStateV0 = {
    categories: CategoriesState;
    events: EventsState;
    memorizedInput: MemorizedInputState;
    rowPlans: RowPlansState;
    visibleDays: VisibleDaysState;
}