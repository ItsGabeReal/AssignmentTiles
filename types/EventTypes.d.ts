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
    onTilePressed?: ((gesture: GestureResponderEvent, event: Event) => void);
    onTileLongPressed?: ((gesture: GestureResponderEvent, event: Event) => void);
    onTileLongPressRelease?: (() => void);
    onTileDragStart?: ((gesture: PanResponderGestureState) => void);
    onTileDropped?: ((gesture: PanResponderGestureState, event: Event) => void);
}

export type CategoryID = string | null;

export type Category = {
    name: string;
    color: ColorValue;
    id: CategoryID;
}