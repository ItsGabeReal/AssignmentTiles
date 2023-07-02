export type EventTileCallbacks = {
    onTilePressed?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileLongPressed?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileLongPressRelease?: (() => void);
    onTileDragStart?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileDrag?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileDropped?: ((gesture: GestureResponderEvent, eventID: string) => void);
    onTileDragTerminated?: ((gesture: GestureResponderEvent, eventID: string) => void);
}