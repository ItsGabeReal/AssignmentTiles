import React, { useState } from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    Appearance,
    StyleProp,
} from 'react-native';
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const MONTH_NAMES_ABREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type AndroidCompactDatePickerProps = {

    /**
     * The current value.
     */
    value?: Date;

    /**
     * Called when a new date is selected.
     */
    onChange: ((newDate: Date) => void);

    style?: StyleProp<ViewStyle>;

    /**
     * Override Android theme.
     */
    themeVariant?: 'light' | 'dark';
}

const AndroidCompactDatePicker: React.FC<AndroidCompactDatePickerProps> = (props) => {
    const {
        themeVariant = Appearance.getColorScheme() || 'light'
    } = props;

    const [dateInput, setDateInput] = useState(props.value || new Date());

    function onDateChanged(newDate?: Date) {
        if (newDate) {
            setDateInput(newDate);
            props.onChange(newDate);
        }
    }

    function handleOnPress() {
        DateTimePickerAndroid.open({
            value: props.value || dateInput,
            onChange: (event, date) => onDateChanged(date)
        });
    }

    function getDateText(date: Date) {
        return `${MONTH_NAMES_ABREV[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    return (
        <TouchableOpacity onPress={handleOnPress} style={[styles.dateTextContainer, props.style]}>
            <Text style={{ color: themeVariant === 'dark' ? 'white' : 'black' }}>{getDateText(props.value || dateInput)}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    dateTextContainer: {
        backgroundColor: '#8882',
        padding: 7,
        borderRadius: 5,
    },
});

export default AndroidCompactDatePicker;