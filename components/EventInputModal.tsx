import React, { useRef } from "react"
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    Button,
    Modal,
    Platform,
    TouchableOpacity,
} from "react-native"
import DatePicker from "react-native-date-picker"
import DateYMD from "../src/DateMDY"
import { EventDetails } from "../types/EventTypes"
import Icon from "react-native-vector-icons/Ionicons";

type EventInputModalProps = {
    initialName?: string;
    
    initialDueDate?: DateYMD;

    visible: boolean;

    submitButtonTitle: string;

    onSubmit: ((eventDetails: EventDetails) => void);

    onRequestClose: (() => void);
}

const EventInputModal: React.FC<EventInputModalProps> = (props) => {
    const eventNameInput = useRef(props.initialName || '');
    const dateInput = useRef((props.initialDueDate || DateYMD.today()).toDate());

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
        <Modal
            style={styles.modal}
            animationType="slide"
            visible={props.visible}
            onRequestClose={props.onRequestClose}
            presentationStyle="pageSheet"
            //transparent={true}
        >
            <View style={styles.mainContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={props.onRequestClose}>
                    <Icon name='ios-close' size={30} />
                </TouchableOpacity>
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
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: '#f00',
        borderRadius: 20,
    },
    mainContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ddd',
    },
    closeButton: {
        backgroundColor: '#fff',
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 50,
        marginBottom: 10,
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

export default EventInputModal;