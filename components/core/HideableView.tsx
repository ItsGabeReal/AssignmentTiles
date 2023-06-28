import React from 'react';
import {
    View,
    ViewProps,
} from 'react-native';

type HideableViewProps = ViewProps & {
    /**
     * When true, this view will collapse to a width and height
     * of 0, and overflow is hidden.
     */
    hidden?: boolean;
};

const HideableView: React.FC<HideableViewProps> = (props) => {
    const isHidden = props.hidden !== undefined ? props.hidden : false;

    return (
        <View style={isHidden ? {width: 0, height: 0, overflow: 'hidden'} : {}}>
            <View style={props.style}>
                {props.children}
            </View>
        </View>
    )
}

export default HideableView;