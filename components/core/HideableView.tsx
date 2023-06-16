import React from 'react';
import {
    View,
    ViewProps,
} from 'react-native';

type HideableViewProps = ViewProps & {
    hidden?: boolean;
};

const HideableView: React.FC<HideableViewProps> = (props) => {
    const isHidden = props.hidden !== undefined ? props.hidden : false;

    return (
        <View style={[props.style, isHidden ? {width: 0, height: 0, overflow: 'hidden'} : {}]}>
            {props.children}
        </View>
    )
}

export default HideableView;