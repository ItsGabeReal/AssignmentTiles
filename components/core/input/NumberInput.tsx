import React, { useState, forwardRef } from 'react';
import {
    TextInput,
    TextInputProps,
    NativeSyntheticEvent,
    TextInputFocusEventData,
} from 'react-native';

type NumberInputProps = Omit<TextInputProps, 'value' | 'defaultValue' | 'onChangeText' | 'inputMode'> & {
    /**
     * Current value.
     */
    value?: number;

    /**
     * Replaces the current value if it's invalid.
     */
    defaultValue?: number;

    /**
     * Limits how low the value can be. onChangeNumber will not output a number lower than this.
     */
    minimimValue?: number;

    /**
     * Limits how high the value can be. onChangeNumber will not output a number lower than this.
     */
    maximumValue?: number;

    /**
     * Called when the value is changed.
     */
    onChangeNumber?: ((value: number) => void);
};

const NumberInput = forwardRef<TextInput, NumberInputProps>((props, ref) => {
    const {
        value,
        defaultValue,
        minimimValue,
        maximumValue,
        onChangeNumber,
        onBlur,
        ...otherProps} = props;

    const [textInputValue, setTextInputValue] = useState(getDefaultValue());

    function stringToInt(string: string) {
        if (string.length === 0) return 0;

        const numericValue = parseInt(string);
        if (!isNaN(numericValue)) return numericValue;
    }

    // Get a valid default value given defaultValue, value, and minimumValue
    function getDefaultValue() {
        let output = 0;

        if (defaultValue !== undefined) {
            output = defaultValue;
        }
        else if (value !== undefined) {
            output = value;
        }
        else if (minimimValue !== undefined) {
            output = minimimValue;
        }

        return output.toString();
    }

    function clampValue(value: number) {
        if (minimimValue !== undefined && value < minimimValue) return minimimValue;
        else if (maximumValue !== undefined && value > maximumValue) return maximumValue;
        else return value;
    }

    // Decide wether or not to accept the input string and call onChangeNumber
    function onChangeText(newText: string) {
        if (newText.length === 0) setTextInputValue(newText); // Allow the text box to be empty
        else if (newText === '-') setTextInputValue(newText); // Don't delete negative sign if it's the only thing in the box
        else { // Otherwise, don't save the newText if a non-number was typed
            const numericValue = stringToInt(newText);

            if (numericValue !== undefined) {
                setTextInputValue(numericValue.toString());
                onChangeNumber?.(clampValue(numericValue));
            }
        }
    }

    // Make sure a valid value is left in the number input field when deselected
    function _onBlur(e: NativeSyntheticEvent<TextInputFocusEventData>) {
        const numericValue = stringToInt(textInputValue);
        if (numericValue !== undefined) {
            setTextInputValue(clampValue(numericValue).toString());
        }
        else setTextInputValue(getDefaultValue());

        onBlur?.(e);
    }

    return (
        <TextInput
            ref={ref}
            value={textInputValue}
            onChangeText={onChangeText}
            onBlur={_onBlur}
            inputMode='numeric'
            selectTextOnFocus
            {...otherProps}
        />
    )
});

export default NumberInput;