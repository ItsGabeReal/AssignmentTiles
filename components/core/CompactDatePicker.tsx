import React, { useState } from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    Appearance,
    StyleProp,
    Platform,
} from 'react-native';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

type CompactDatePickerProps = {

    /**
     * The current value.
     */
    value: Date;

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

const CompactDatePicker: React.FC<CompactDatePickerProps> = (props) => {
    if (Platform.OS == 'android') {
        return (
            <AndroidCompactDatePicker
                value={props.value}
                onChange={props.onChange}
                style={props.style}
                themeVariant={props.themeVariant}
            />
        );
    }
    else if (Platform.OS == 'ios') {
        return (
            <RNDateTimePicker
                mode='date'
                value={props.value || new Date()}
                onChange={(event, date) => props.onChange(date || new Date())}
                style={props.style}
                themeVariant={props.themeVariant}
            />
        );
    }
    else {
        console.error(`CompactDatePicker: ${Platform.OS} is not supported yet.`);
        return (<></>);
    }
}

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
            <Text style={{ color: themeVariant === 'light' ? 'black' : 'white' }}>{getDateText(props.value || dateInput)}</Text>
        </TouchableOpacity>

    );
}

const styles = StyleSheet.create({
    dateTextContainer: {
        alignSelf: 'flex-end',
        backgroundColor: '#8882',
        padding: 7,
        borderRadius: 5,
    },
});

export default CompactDatePicker;