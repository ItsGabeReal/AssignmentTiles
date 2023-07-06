export type Vector2D = {
    x: number;
    y: number;
}

export type EventTileCallbacks = {
    onTilePressed?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileLongPressed?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileDragStart?: ((gesture: GestureResponderEvent, eventID: string) => void);
}