import React, { useEffect, useRef, useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import AndroidCompactDatePicker from "./core/AndroidCompactDatePicker";
import SubmitButton from "./core/SubmitButton";
import DateYMD from "../src/DateYMD";
import { EventDetails } from "../types/EventTypes";
import { Platform } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type EventInputProps = {
    initialName?: string;
    
    initialDueDate?: DateYMD;

    visible: boolean;

    submitButtonTitle: string;

    onSubmit: ((eventDetails: EventDetails) => void);

    onRequestClose: (() => void);
}

const EventInput: React.FC<EventInputProps> = (props) => {
    const [eventNameInput, setEventNameInput] = useState(props.initialName || '');
    const eventNameInputRef = useRef<TextInput>(null);
    //const eventNameInput = useRef(props.initialName || '');
    const dateInput = useRef((props.initialDueDate || DateYMD.today()).toDate());
    
    useEffect(() => {
        /* 
        * There's a bug on android where enabling autofocus on text
        * inputs doesn't automatically show the keyboard.
        * This fixes that.
        */
        setTimeout(() => { eventNameInputRef.current?.focus(); }, 75);
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
        return (eventNameInput.length > 0);
    }

    function onSubmit() {
        if (readyToSubmit()) {
            props.onRequestClose();
            
            const newEvent: EventDetails = {
                name: eventNameInput,
                completed: false,
                id: Math.random().toString(),
                dueDate: DateYMD.fromDate(dateInput.current),
            };

            props.onSubmit(newEvent);
        }
    }

    return (
        <>
            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={props.onRequestClose} hitSlop={10}>
                    <Icon name='ios-close' size={26} />
                </TouchableOpacity>
                <View style={styles.submitButtonContainer}>
                    <SubmitButton title={props.submitButtonTitle} onPress={onSubmit} disabled={!readyToSubmit()} />
                </View>
            </View>
            <View style={styles.inputContainer}>
                
                <View style={styles.parameterContainer}>
                    <TextInput
                        ref={eventNameInputRef}
                        defaultValue={props.initialName}
                        placeholder="Name"
                        //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                        onChangeText={changedText => { setEventNameInput(changedText); }}
                    />
                </View>
                <View style={styles.parameterContainer}>
                    <View style={styles.dueDateContainer}>
                        <Text>Due Date:</Text>
                        <View style={{flex: 1}}>
                            {showDatePicker()}
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    actionsContainer: {
        flexDirection: 'row',
        marginBottom: 25,
        alignItems: 'center',
    },
    submitButtonContainer: {
        marginLeft: 'auto',
    },
    submitButtonText: {
        fontWeight: 'bold',
        color: '#06f',
        fontSize: 18,
    },
    inputContainer: {
        flex: 1,
    },
    parameterContainer: {
        padding: 15,
        backgroundColor: '#f4f4f4',
        borderRadius: 10,
        borderColor: '#aaa',
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 10,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default EventInput;