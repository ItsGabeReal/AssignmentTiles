import React, { useState, useRef } from 'react';
import {
    TextInput,
    TextInputProps,
    NativeSyntheticEvent,
    TextInputFocusEventData,
} from 'react-native';

type NumberInputProps = Omit<TextInputProps, 'value' | 'defaultValue' | 'onChangeText' | 'inputMode'> & {
    value?: number;
    defaultValue?: number;
    minimimValue?: number;
    onChangeNumber?: ((value: number) => void);
};

const NumberInput: React.FC<NumberInputProps> = (props) => {
    const {
        value,
        defaultValue,
        minimimValue,
        onChangeNumber,
        onBlur,
        ...otherProps} = props;

    const [textInputValue, setTextInputValue] = useState(getDefaultValue());

    function stringToInt(string: string) {
        if (string.length === 0) return 0;

        const numericValue = parseInt(string);
        if (!isNaN(numericValue)) return numericValue;
    }

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

    function getOutputValue(value: number) {
        if (minimimValue !== undefined && value < minimimValue) {
            return minimimValue;
        }
        else return value;
    }

    return (
        <TextInput
            value={textInputValue}
            onChangeText={value => {
                if (value.length === 0) setTextInputValue(value); // Allow the text box to be empty
                else { // Otherwise, don't save the value if a non-number was typed
                    const numericValue = stringToInt(value);
                    if (numericValue !== undefined) {
                        setTextInputValue(numericValue.toString());
                        onChangeNumber?.(getOutputValue(numericValue));
                    }
                }
            }}
            onBlur={(e: NativeSyntheticEvent<TextInputFocusEventData>) => { // Make sure text input is set to a valid value on blur
                const numericValue = stringToInt(textInputValue);
                if (numericValue !== undefined) {
                    setTextInputValue(getOutputValue(numericValue).toString());
                }
                else setTextInputValue(getDefaultValue());

                onBlur?.(e);
            }}
            inputMode='numeric'
            {...otherProps}
        />
    )
}

export default NumberInput;