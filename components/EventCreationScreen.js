import { useRef, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
} from "react-native";

export default function EventCreationScreen({ initialDate, onEventCreated }) {
    const eventNameInput = useRef("");

    const [dateInput, setDateInput] = useState(initializeDate());

    function initializeDate() {
        if (initialDate) return (initialDate);
        else return (new Date());
    }

    function readyToSubmit() {
        return (eventNameInput.current.length > 0);
    }

    function onSubmit() {
        if (readyToSubmit()) {
            const eventDetails = {
                date: dateInput,
                name: eventNameInput.current
            };

            if (onEventCreated) onEventCreated(eventDetails);
        }
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.inputContainer}>
                <Text>Event Name:</Text>
                <TextInput
                    autoFocus={true}
                    onChangeText={changedText => {eventNameInput.current = changedText;}}
                    style={styles.eventNameTextInput}
                />
                <Text>Due Date:</Text>
                <Text>{dateInput.getMonth() + 1}/{dateInput.getDate()}/{dateInput.getFullYear()}</Text>
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
        padding: 30,
    },
    inputContainer: {
        flex: 1,
    },
    eventNameTextInput: {
        backgroundColor: '#f8f8f8',
        marginTop: 5,
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#bbb',
    },
    createEventButtonContainer: {
        alignItems: 'center',
    },
});