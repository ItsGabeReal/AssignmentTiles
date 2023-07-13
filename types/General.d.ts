export type Vector2D = {
    x: number;
    y: number;
}

export type EventTileCallbacks = {
    onTileLongPressed?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileDragStart?: ((gesture: GestureResponderEvent, eventID: string) => void);
}