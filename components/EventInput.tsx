import React, { useRef } from "react"
import { View, TextInput, StyleSheet, Text, Button } from "react-native"
import DatePicker from "react-native-date-picker"
import DateYMD from "../src/DateMDY"
import { EventDetails } from "../types/EventTypes"

type EventInputProps = {
    initialName?: string;
    
    initialDueDate?: DateYMD;

    submitButtonTitle: string;

    onSubmit: ((eventDetails: EventDetails) => void);
}

const EventInput: React.FC<EventInputProps> = (props) => {
    const eventNameInput = useRef(props.initialName || '');
    const dateInput = useRef((props.initialDueDate || DateYMD.today()).toDate());

    function readyToSubmit(): boolean {
        return (eventNameInput.current.length > 0);
    }

    function onSubmit() {
        if (readyToSubmit()) {
            const newEvent: EventDetails = {
                name: eventNameInput.current,
                dueDate: DateYMD.fromDate(dateInput.current),
                id: Math.random().toString(),
            };

            props.onSubmit(newEvent);
        }
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.inputContainer}>
                <View style={styles.parameterContainer}>
                    <TextInput
                        defaultValue={props.initialName}
                        placeholder="Name"
                        autoFocus={true}
                        onChangeText={changedText => { eventNameInput.current = changedText; }}
                    />
                </View>
                <View style={styles.parameterContainer}>
                    <Text>Due Date:</Text>
                    <DatePicker
                        mode="date"
                        date={dateInput.current} // <- TEST TO MAKE SURE IT WORKS IF initialDate IS NOT PROVIDED
                        androidVariant="nativeAndroid"
                        onDateChange={newDate => { dateInput.current = newDate; }}
                    />
                </View>
            </View>
            <View style={styles.createEventButtonContainer}>
                <Button title={props.submitButtonTitle} onPress={onSubmit} />
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ddd',
    },
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
    createEventButtonContainer: {
        alignItems: 'center',
    },
});

export default EventInput;