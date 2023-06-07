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

    return (
        <View pointerEvents='box-none' style={styles.mainContainer}>
            <TouchableOpacity onPress={handleOnPress} style={{...styles.dateTextContainer, ...props.style}}>
                <Text>{MONTH_NAMES_ABREV[dateInput.getMonth()]} {dateInput.getDate()}, {dateInput.getFullYear()}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        alignItems: 'flex-end',
    },
    dateTextContainer: {
        backgroundColor: '#e4e4e4',
        padding: 7,
        borderRadius: 5,
    },
});

export default AndroidCompactDatePicker;