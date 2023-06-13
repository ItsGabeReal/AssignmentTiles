import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Button,
    TextInput,
    ScrollView,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import AndroidCompactDatePicker from './core/AndroidCompactDatePicker';
import SubmitButton from './core/SubmitButton';
import DateYMD from '../src/DateYMD';
import { EventDetails } from '../types/EventTypes';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CategoryContext from '../context/CategoryContext';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import generalStyles from '../src/GeneralStyles';
import CloseButton from './core/CloseButton';
import CategoryEditor from './CategoryEditor';

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
    const categoryInputRef = useRef<CategoryInputRef | null>(null);
    const categoryEditorRef = useRef<CategoryInputRef | null>(null);
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
            <CategoryInput ref={categoryInputRef} onCategoryCreated={category => setSelectedCategory(category.id)} />
            <CategoryEditor ref={categoryEditorRef} />
            <View style={styles.actionsContainer}>
                <CloseButton onPress={props.onRequestClose} hitSlop={10} size={26} color='white' />
                <View style={styles.submitButtonContainer}>
                    <SubmitButton title={props.submitButtonTitle} onPress={onSubmit} disabled={!readyToSubmit()} />
                </View>
            </View>
            <ScrollView
                style={styles.inputContainer}
                keyboardDismissMode='on-drag'
            >
                <Text style={[generalStyles.fieldDescription, {fontWeight: 'bold'}]}>Name:</Text>
                    <TextInput
                        ref={eventNameInputRef}
                        defaultValue={props.initialName}
                        //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                        onChangeText={changedText => { setEventNameInput(changedText); }}
                        style={[generalStyles.parameterContainer, {color: 'white'}]}
                        keyboardAppearance='dark'
                    />
                <Text style={generalStyles.fieldDescription}>Due:</Text>
                <View style={generalStyles.parameterContainer}>
                    <View style={styles.dueDateContainer}>
                        {showDatePicker()}
                    </View>
                </View>
                <Text style={generalStyles.fieldDescription}>Category:</Text>
                <View style={[generalStyles.parameterContainer, {padding: 0, overflow: 'hidden'}]}>
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
                <View style={{flexDirection: 'row'}}>
                    <Button title='Create' onPress={() => categoryInputRef.current?.open()} />
                    <Button title='Edit' onPress={() => categoryEditorRef.current?.open()} />
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
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    androidPickerItem: {
        backgroundColor: '#333',
    }
});

export default EventInput;