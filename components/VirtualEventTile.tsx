import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
    StyleSheet,
    Animated,
} from 'react-native';
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import EventTile from './EventTile';
import VisualSettings from '../src/VisualSettings';

export type VirtualEventTileRef = {
    setDragPosition: ((pageX: number, pageY: number) => void);
    show: ((eventID: string) => void);
    hide: (() => void);
}

type VirtualEventTileProps = {
    //plannedDate: DateYMD;
}

const VirtualEventTile = forwardRef<VirtualEventTileRef, VirtualEventTileProps>((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [displayedEventID, setDisplayedEventID] = useState('');
    
    const pan = useRef(new Animated.ValueXY);

    useImperativeHandle(ref, () => ({
        setDragPosition(pageX, pageY) {
            const {width, height} = VisualSettings.EventTile.mainContainer;
            pan.current.x.setValue(pageX - (width / 2));
            pan.current.y.setValue(pageY - (height / 2));
        },
        show(eventID: string) {
            setVisible(true);
            setDisplayedEventID(eventID);
        },
        hide() {
            setVisible(false);
        }
    }));

    if (!visible) return(<></>);

    return (
        <Animated.View
            style={[styles.mainContainer, {left: pan.current.x, top: pan.current.y}]}
        >
            <EventTile eventID={displayedEventID} plannedDate={DateYMDHelpers.today()} />
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    mainContainer: {
        position: 'absolute',
        opacity: 0.5,
    }
});

export default VirtualEventTile;