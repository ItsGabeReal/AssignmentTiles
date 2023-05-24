import React from 'react';
import { GestureResponderEvent, PanResponderGestureState } from 'react-native/types';
import { Event } from '../types/EventTypes';

export type CallbackContextType = {
    onTileDragStart: ((gesture: GestureResponderEvent) => void);
    onTileDropped: ((gesture: PanResponderGestureState, event: Event) => void);
}

export default React.createContext<CallbackContextType | null>(null);