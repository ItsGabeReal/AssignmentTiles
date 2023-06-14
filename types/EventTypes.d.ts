import DateYMD from "../src/DateYMD";

export interface Event {
    name: string;
    completed: boolean;
    categoryID?: string;
    dueDate?: DateYMD;
    id: string;
}

export interface EventsOnDate {
    plannedDate: DateYMD;
    orderedEventIDs: string[];
}

export type EventTileCallbacks = {
    onTilePressed?: ((gesture: GestureResponderEvent, event: EventDetails) => void);
    onTileLongPressed?: ((gesture: GestureResponderEvent, event: EventDetails) => void);
    onTileLongPressRelease?: (() => void);
    onTileDragStart?: ((gesture: PanResponderGestureState) => void);
    onTileDropped?: ((gesture: PanResponderGestureState, event: EventDetails) => void);
}

export type Category = {
    name: string;
    color: ColorValue;
    id: string;
}