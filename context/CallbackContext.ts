import React from 'react';
import { GestureResponderEvent, PanResponderGestureState } from 'react-native/types';
import { EventDetails } from '../types/EventTypes';

export type CallbackContextType = {
    onTileDragStart: ((gesture: GestureResponderEvent) => void);
    onTileDropped: ((gesture: PanResponderGestureState, event: EventDetails) => void);
    onTilePressed: ((gesture: GestureResponderEvent, event: EventDetails) => void);
}

export default React.createContext<CallbackContextType | null>(null);