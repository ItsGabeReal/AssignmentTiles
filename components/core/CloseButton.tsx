import React from 'react';
import {
    ColorValue,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type CloseButtonProps = {
    /**
     * This defines how far your touch can start away from the button.
     * This is added to pressRetentionOffset when moving off of the button.
     * NOTE The touch area never extends past the parent view bounds and the
     * Z-index of sibling views always takes precedence if a touch hits two
     * overlapping views.
     */
    hitSlop?: number;

    size?: number;

    color?: ColorValue;

    style?: ViewStyle;

    onPress?: (() => void);
}

const CloseButton: React.FC<CloseButtonProps> = (props) => {
    return (
        <TouchableOpacity onPress={props.onPress} hitSlop={props.hitSlop} style={props.style}>
            <Icon name='close' size={props.size} color={props.color} />
        </TouchableOpacity>
    )
}

export default CloseButton;