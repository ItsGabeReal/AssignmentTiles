import React, { useState } from 'react';
import {
    ColorValue,
    TouchableOpacity,
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

    size?: number;

    color?: ColorValue;

    hitSlop?: number;
}

const Checkbox: React.FC<CheckboxProps> = (props) => {
    const {
        size = 20,
        hitSlop = 10
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

    return (
        <TouchableOpacity onPress={onPress} hitSlop={hitSlop}>
            <Icon name={getValue() ? 'check-box' : 'check-box-outline-blank'} size={size} color={props.color}/>
        </TouchableOpacity>
    );
};

export default Checkbox;