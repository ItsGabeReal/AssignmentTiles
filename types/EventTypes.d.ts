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