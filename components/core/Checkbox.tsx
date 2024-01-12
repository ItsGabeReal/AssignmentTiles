import React, { useState } from 'react';
import {
    ColorValue,
    StyleProp,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type CheckboxProps = {
    /**
     * Defines the default value of the checkbox.
     * 
     * Note: If the value prop is specified, defaultValue will be ignored.
     */
    defaultValue?: boolean;

    /**
     * Sets the value of the checkbox (checkbox state will be foreced to match this value)
     */
    value?: boolean;

    /**
     * Called when checkbox is checked/unchecked
     */
    onChange?: ((value: boolean) => void);

    /**
     * The visual appearance of the checkbox. Default is 'square'.
     */
    visualStyle?: 'square' | 'round';

    style?: StyleProp<ViewStyle>;

    size?: number;

    color?: ColorValue;

    hitSlop?: number;
}

const Checkbox: React.FC<CheckboxProps> = (props) => {
    const {
        size = 20,
        hitSlop = 10,
        visualStyle = 'square'
    } = props;

    const [checked, setChecked] = useState(props.defaultValue || false);

    function onPress() {
        if (props.value === undefined) {
            props.onChange?.(!checked);
            setChecked(!checked);
        }
        else {
            props.onChange?.(!props.value);
        }
    }

    function getValue() {
        return props.value ==! undefined ? props.value : checked;
    }

    function getIconName() {
        if (visualStyle === 'square') {
            return getValue() ? 'check-box' : 'check-box-outline-blank';
        }
        else {
            return getValue() ? 'check-circle-outline' : 'radio-button-unchecked'
        }
    }

    return (
        <TouchableOpacity style={props.style} onPress={onPress} hitSlop={hitSlop}>
            <Icon name={getIconName()} size={size} color={props.color}/>
        </TouchableOpacity>
    );
};

export default Checkbox;