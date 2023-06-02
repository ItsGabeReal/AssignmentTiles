import React from 'react';
import { GestureResponderEvent } from 'react-native/types';
import { EventDetails } from '../types/EventTypes';

export type CallbackContextType = {
    onTilePressed: ((gesture: GestureResponderEvent, event: EventDetails) => void);
    onTileLongPressed: ((gesture: GestureResponderEvent, event: EventDetails) => void);
    onTileLongPressRelease: (() => void);
    onTileDragStart: ((gesture: GestureResponderEvent) => void);
    onTileDropped: ((gesture: GestureResponderEvent, event: EventDetails) => void);
}

export default React.createContext<CallbackContextType | null>(null);