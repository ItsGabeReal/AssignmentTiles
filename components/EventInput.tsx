import React, { useEffect, useRef } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    Button,
} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import AndroidCompactDatePicker from "./AndroidCompactDatePicker";
import DateYMD from "../src/DateYMD";
import { EventDetails } from "../types/EventTypes";
import { Platform } from "react-native";

type EventInputProps = {
    initialName?: string;
    
    initialDueDate?: DateYMD;

    visible: boolean;

    submitButtonTitle: string;

    onSubmit: ((eventDetails: EventDetails) => void);

    onRequestClose: (() => void);
}

const EventInput: React.FC<EventInputProps> = (props) => {
    const eventNameInputRef = useRef<TextInput>(null);
    const eventNameInput = useRef(props.initialName || '');
    const dateInput = useRef((props.initialDueDate || DateYMD.today()).toDate());
    
    useEffect(() => {
        /* 
        * There's a bug on android where enabling autofocus on text
        * inputs doesn't automatically show the keyboard.
        * This fixes that.
        */
        setTimeout(() => { eventNameInputRef.current?.focus(); }, 50);
    });

    function onDateChanged(newDate?: Date) {
        if (newDate) {
            dateInput.current = newDate;
        }
    }

    function showDatePicker() {
        if (Platform.OS == 'android') {
            return (
                <AndroidCompactDatePicker
                    value={props.initialDueDate?.toDate()}
                    onChange={onDateChanged}
                    style={{marginLeft: 8}}
                />
            );
        }
        else if (Platform.OS == 'ios') {
            return (
                <RNDateTimePicker
                    mode='date'
                    value={dateInput.current}
                    onChange={(event, date) => onDateChanged(date)}
                />
            );
        }
        else {
            console.error(`EventInput -> showDatePicker: ${Platform.OS} is not supported yet.`);
            return (<></>);
        }
    }

    function readyToSubmit(): boolean {
        return (eventNameInput.current.length > 0);
    }

    function onSubmit() {
        if (readyToSubmit()) {
            props.onRequestClose();
            
            const newEvent: EventDetails = {
                name: eventNameInput.current,
                dueDate: DateYMD.fromDate(dateInput.current),
                id: Math.random().toString(),
            };

            props.onSubmit(newEvent);
        }
    }

    return (
        <>
            <View style={styles.inputContainer}>
                <View style={styles.parameterContainer}>
                    <TextInput
                        ref={eventNameInputRef}
                        defaultValue={props.initialName}
                        placeholder="Name"
                        //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                        onChangeText={changedText => { eventNameInput.current = changedText; }}
                    />
                </View>
                <View style={styles.parameterContainer}>
                    <View style={styles.dueDateContainer}>
                        <Text>Due Date:</Text>
                        {showDatePicker()}
                    </View>
                </View>
            </View>
            <View style={styles.createEventButtonContainer}>
                <Button title={props.submitButtonTitle} onPress={onSubmit} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flex: 1,
    },
    parameterContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#bbb',
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 10,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    createEventButtonContainer: {
        alignItems: 'center',
    },
});

export default EventInput;