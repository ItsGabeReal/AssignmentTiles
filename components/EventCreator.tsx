import React, { useRef } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
} from "react-native";
import { today } from "../src/helpers";

import DatePicker from "react-native-date-picker";

export interface EventCreatorOutput {
    name: string;
    date: Date;
}

type EventCreatorProps = {
    /**
     * The default date shown on the date picker.
     */
    initialDate?: Date;

    onEventCreated: ((eventDetails: EventCreatorOutput) => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    const eventNameInput = useRef("");

    const dateInput = useRef(props.initialDate || today());

    function readyToSubmit(): boolean {
        return (eventNameInput.current.length > 0);
    }

    function onSubmit() {
        if (readyToSubmit()) {
            const eventDetails: EventCreatorOutput = {
                date: dateInput.current,
                name: eventNameInput.current
            };

            props.onEventCreated(eventDetails);
        }
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.inputContainer}>
                <View style={styles.parameterContainer}>
                    <TextInput
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
                <Button title="Create Event" onPress={onSubmit} />
            </View>
        </View>
    );
};

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

export default EventCreator;