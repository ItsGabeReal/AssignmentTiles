import React from 'react';
import { GestureResponderEvent, PanResponderGestureState } from 'react-native/types';
import { EventDetails } from '../types/EventTypes';

export type CallbackContextType = {
    onTilePressed: ((gesture: GestureResponderEvent, event: EventDetails) => void);
    onTileLongPressed: ((gesture: GestureResponderEvent, event: EventDetails) => void);
    onTileLongPressRelease: (() => void);
    onTileDragStart: ((gesture: PanResponderGestureState) => void);
    onTileDropped: ((gesture: PanResponderGestureState, event: EventDetails) => void);
}

export default React.createContext<CallbackContextType | null>(null);