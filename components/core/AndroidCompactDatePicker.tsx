import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const MONTH_NAMES_ABREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type AndroidCompactDatePickerProps = {
    value?: Date;

    onChange: ((newDate: Date) => void);

    style?: ViewStyle;

    themeVariant?: 'light' | 'dark';
}

const AndroidCompactDatePicker: React.FC<AndroidCompactDatePickerProps> = (props) => {
    const [dateInput, setDateInput] = useState(props.value || new Date());

    function onDateChanged(newDate?: Date) {
        if (newDate) {
            setDateInput(newDate);
            props.onChange(newDate);
        }
    }

    function handleOnPress() {
        DateTimePickerAndroid.open({
            value: dateInput,
            onChange: (event, date) => onDateChanged(date)
        });
    }

    function getThemeTextColor() {
        let useLightMode = true;

        if (props.themeVariant) {
            if (props.themeVariant == 'dark') useLightMode = false;
            else if (props.themeVariant == 'light') useLightMode = true;
            else {
                console.error(`AndroidCompactDatePicker: ${props.themeVariant} is not a valid value for themeVariant. Must be either 'light' or 'dark'.`);
            }
        }

        if (useLightMode) return 'black'
        else return 'white'
    }

    return (
        <View pointerEvents='box-none' style={styles.mainContainer}>
            <TouchableOpacity onPress={handleOnPress} style={[styles.dateTextContainer, props.style]}>
                <Text style={{color: getThemeTextColor()}}>{MONTH_NAMES_ABREV[dateInput.getMonth()]} {dateInput.getDate()}, {dateInput.getFullYear()}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        alignItems: 'flex-end',
    },
    dateTextContainer: {
        backgroundColor: '#8882',
        padding: 7,
        borderRadius: 5,
    },
});

export default AndroidCompactDatePicker;