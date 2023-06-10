import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import AndroidCompactDatePicker from './core/AndroidCompactDatePicker';
import SubmitButton from './core/SubmitButton';
import DateYMD from '../src/DateYMD';
import { EventDetails } from '../types/EventTypes';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import CategoryContext from '../context/CategoryContext';

type EventInputProps = {
    initialName?: string;
    
    initialDueDate?: DateYMD;

    initialCategoryID?: string;

    visible: boolean;

    submitButtonTitle: string;

    onSubmit: ((eventDetails: EventDetails) => void);

    onRequestClose: (() => void);
}

const EventInput: React.FC<EventInputProps> = (props) => {
    const categoryContext = useContext(CategoryContext);

    const [eventNameInput, setEventNameInput] = useState(props.initialName || '');
    const [selectedCategory, setSelectedCategory] = useState(props.initialCategoryID ? props.initialCategoryID : 'none');
    
    const eventNameInputRef = useRef<TextInput>(null);
    const dateInput = useRef((props.initialDueDate || DateYMD.today()).toDate());
    
    useEffect(() => {
        /* 
        * There's a bug on android where enabling autofocus on text
        * inputs doesn't automatically show the keyboard.
        * This fixes that.
        */
        setTimeout(() => { eventNameInputRef.current?.focus(); }, 75);
    }, []);

    function onDateChanged(newDate?: Date) {
        if (newDate) {
            dateInput.current = newDate;
        }
    }

    function showDatePicker() {
        if (Platform.OS == 'android') {
            return (
                <AndroidCompactDatePicker
                    value={dateInput.current}
                    onChange={onDateChanged}
                    themeVariant='dark'
                />
            );
        }
        else if (Platform.OS == 'ios') {
            return (
                <RNDateTimePicker
                    mode='date'
                    value={dateInput.current}
                    onChange={(event, date) => onDateChanged(date)}
                    themeVariant='dark'
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
                categoryID: selectedCategory == 'none' ? undefined : selectedCategory,
            };

            props.onSubmit(newEvent);
        }
    }

    return (
        <>
            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={props.onRequestClose} hitSlop={10}>
                    <Icon name='ios-close' size={26} color='white' />
                </TouchableOpacity>
                <View style={styles.submitButtonContainer}>
                    <SubmitButton title={props.submitButtonTitle} onPress={onSubmit} disabled={!readyToSubmit()} />
                </View>
            </View>
            <ScrollView
                style={styles.inputContainer}
                keyboardDismissMode='on-drag'
            >
                <Text style={[styles.fieldDescription, {fontWeight: 'bold'}]}>Name:</Text>
                <Pressable style={styles.parameterContainer} onPress={() => eventNameInputRef.current?.focus()}>
                    <TextInput
                        ref={eventNameInputRef}
                        defaultValue={props.initialName}
                        //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                        onChangeText={changedText => { setEventNameInput(changedText); }}
                        style={{color: 'white'}}
                        keyboardAppearance='dark'
                    />
                </Pressable>
                <Text style={styles.fieldDescription}>Due:</Text>
                <View style={styles.parameterContainer}>
                    <View style={styles.dueDateContainer}>
                        {showDatePicker()}
                    </View>
                </View>
                <Text style={styles.fieldDescription}>Category:</Text>
                <View style={[styles.parameterContainer, {padding: 0, overflow: 'hidden'}]}>
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(value, name) => setSelectedCategory(value)}
                        mode='dropdown'
                        dropdownIconColor='white'
                    >
                        <Picker.Item key='none' label='None' value='none' color='#bbb' style={styles.androidPickerItem} />
                        {categoryContext.state.map(item => (
                            <Picker.Item key={item.id} label={item.name} value={item.id} color={item.color} style={styles.androidPickerItem} />
                        ))}
                    </Picker>
                </View>
            </ScrollView>
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
    fieldDescription: {
        color: 'white',
        marginLeft: 10,
        marginBottom: 5,
    },
    parameterContainer: {
        padding: 15,
        backgroundColor: '#333',
        borderRadius: 10,
        borderColor: '#666',
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 15,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    androidPickerItem: {
        backgroundColor: '#333',
    }
});

export default EventInput;