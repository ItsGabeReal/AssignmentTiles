import DateYMD from "../src/DateYMD";

export interface EventDetails {
    name: string;
    completed: boolean;
    id: string;
    categoryID?: string;
    dueDate?: DateYMD;
}

export interface RowEvents {
    date: DateYMD;
    events: EventDetails[];
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