import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Button,
    TextInput,
    ScrollView,
    Switch,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import AndroidCompactDatePicker from './core/AndroidCompactDatePicker';
import IosStyleButton from './core/IosStyleButton';
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import { CategoryID, Event, EventDetails } from '../types/EventTypes';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import generalStyles from '../src/GeneralStyles';
import CloseButton from './core/CloseButton';
import CategoryEditor from './CategoryEditor';
import { useAppSelector } from '../src/redux/hooks';
import NumberInput from './core/NumberInput';
import HideableView from './core/HideableView';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BlurView } from 'expo-blur';

export type RepeatSettings = {
    valueType: RepeatValueType;
    value: number;
    recurrences: number;
}

export type RepeatValueType = 'days' | 'weeks' | 'months';

type DueType = 'none' | 'before-date';

type EventInputProps = {
    initialName?: string;
    
    initialDueDate?: DateYMD | null;

    initialCategoryID?: CategoryID;

    visible: boolean;

    editingEvent?: boolean;

    onSubmit: ((eventDetails: EventDetails, repeatSettings: RepeatSettings | null) => void);

    onRequestClose: (() => void);
}

const EventInput: React.FC<EventInputProps> = (props) => {
    const categories = useAppSelector(state => state.categories);

    const [eventNameInput, setEventNameInput] = useState(props.initialName || '');
    const [selectedDueTypeIndex, setSelectedDueTypeIndex] = useState(props.initialDueDate != null ? 1 : 0);
    const [dueTypeInput, setDueTypeInput] = useState<DueType>(props.initialDueDate != null ? 'before-date' : 'none');
    const [dueDateInput, setDueDateInput] = useState(DateYMDHelpers.toDate(props.initialDueDate || DateYMDHelpers.today()));
    const [repeatSwitchValue, setRepeatSwitchValue] = useState(false);
    const [repeatRecurrences, setRepeatRecurrences] = useState(2);
    const [repeatValueInput, setRepeatValueInput] = useState(7);
    const [repeatValueTypeInput, setRepeatValueTypeInput] = useState<RepeatValueType>('days');
    const [selectedCategory, setSelectedCategory] = useState(props.initialCategoryID ? props.initialCategoryID : 'none');
    
    const eventNameInputRef = useRef<TextInput>(null);
    const categoryInputRef = useRef<CategoryInputRef | null>(null);
    const categoryEditorRef = useRef<CategoryInputRef | null>(null);
    
    useEffect(() => {
        /* 
        * There's a bug on android where enabling autofocus on text
        * inputs doesn't automatically show the keyboard.
        * This fixes that.
        */
        if (!props.editingEvent) {
            setTimeout(() => { eventNameInputRef.current?.focus(); }, 75);
        }
    }, []);

    function onDateChanged(newDate?: Date) {
        if (newDate) {
            setDueDateInput(newDate);
        }
    }

    function PlatformSpecificDatePicker() {
        if (Platform.OS == 'android') {
            return (
                <AndroidCompactDatePicker
                    value={dueDateInput}
                    onChange={onDateChanged}
                    themeVariant='dark'
                />
            );
        }
        else if (Platform.OS == 'ios') {
            return (
                <RNDateTimePicker
                    mode='date'
                    value={dueDateInput}
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
            
            const details: EventDetails = {
                name: eventNameInput,
                dueDate: dueTypeInput === 'before-date' ? DateYMDHelpers.fromDate(dueDateInput) : null,
                categoryID: selectedCategory === 'none' ? null : selectedCategory,
            };

            const repeatSettings: RepeatSettings = {
                valueType: repeatValueTypeInput,
                value: repeatValueInput,
                recurrences: repeatRecurrences,
            }

            props.onSubmit(details, repeatSwitchValue ? repeatSettings : null);
        }
    }

    return (
        <>
            <CategoryInput ref={categoryInputRef} onCategoryCreated={category => setSelectedCategory(category.id || 'none')} />
            <CategoryEditor ref={categoryEditorRef} />
            <View style={styles.mainContainer}>
                {/*<CloseButton onPress={props.onRequestClose} hitSlop={10} size={26} color='white' style={{ position: 'absolute' }} />*/}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{props.editingEvent ? 'Edit Assignment' : 'Create Assignment'}</Text>
                </View>
                <ScrollView
                    style={styles.inputContainer}
                    //keyboardDismissMode='on-drag'
                >
                    <Text style={[generalStyles.fieldDescription, { fontWeight: 'bold' }]}>Name:</Text>
                    <TextInput
                        ref={eventNameInputRef}
                        defaultValue={props.initialName}
                        //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                        onChangeText={setEventNameInput}
                        selectTextOnFocus
                        style={[generalStyles.parameterContainer, { color: 'white' }]}
                        keyboardAppearance='dark'
                    />
                    <Text style={generalStyles.fieldDescription}>Due:</Text>
                    <View style={generalStyles.parameterContainer}>
                        <SegmentedControl
                            values={['None', 'Before Date']}
                            selectedIndex={selectedDueTypeIndex}
                            onChange={(event) => {
                                const index = event.nativeEvent.selectedSegmentIndex;
                                setSelectedDueTypeIndex(index);

                                switch (index) {
                                    case 0:
                                        setDueTypeInput('none');
                                        break;
                                    case 1:
                                        setDueTypeInput('before-date');
                                        break;
                                }
                            }}
                            appearance='dark'
                        />
                        <HideableView hidden={dueTypeInput !== 'before-date'}>
                            <View style={[styles.dueDateContainer, { marginTop: 15 }]}>
                                <PlatformSpecificDatePicker />
                            </View>
                            <View style={styles.repeatSwitchContainer}>
                                <Text style={{ color: 'white' }}>Repeats:</Text>
                                <Switch value={repeatSwitchValue} onValueChange={setRepeatSwitchValue} style={{ marginLeft: 10 }} />
                            </View>
                            <HideableView hidden={!repeatSwitchValue}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: 'white' }}>Every </Text>
                                    <NumberInput
                                        minimimValue={1}
                                        defaultValue={7}
                                        onChangeNumber={setRepeatValueInput}
                                        style={styles.numberInput}
                                    />
                                    <Text style={{ color: 'white' }}> days</Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                    <Text style={{ color: 'white' }}>End after </Text>
                                    <NumberInput
                                        minimimValue={2}
                                        onChangeNumber={setRepeatRecurrences}
                                        style={styles.numberInput}
                                    />
                                    <Text style={{ color: 'white' }}> recurrences</Text>
                                </View>
                            </HideableView>
                        </HideableView>
                    </View>
                    <Text style={generalStyles.fieldDescription}>Category:</Text>
                    <View style={[generalStyles.parameterContainer, { padding: 0, overflow: 'hidden' }]}>
                        <Picker
                            selectedValue={selectedCategory}
                            onValueChange={setSelectedCategory}
                            mode='dropdown'
                            dropdownIconColor='white'
                        >
                            <Picker.Item key='none' label='None' value='none' color='#bbb' style={styles.androidPickerItem} />
                            {categories.map(item => (
                                <Picker.Item key={item.id} label={item.name} value={item.id} color={item.color} style={styles.androidPickerItem} />
                            ))}
                        </Picker>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 50 }}>
                        <Button title='Create' onPress={() => categoryInputRef.current?.open()} />
                        <Button title='Edit' onPress={() => categoryEditorRef.current?.open()} />
                    </View>
                </ScrollView>
            </View>
            <BlurView style={styles.keyboardAttachedView} intensity={30}>
                <View style={styles.actionContainer}>
                    <IosStyleButton
                        title='Cancel'
                        color='#aaa'
                        textStyle={styles.actionText}
                        onPress={props.onRequestClose}
                        hitSlop={30}
                    />
                </View>
                <View style={styles.actionContainer}>
                    <IosStyleButton
                        title={props.editingEvent ? 'Save' : 'Create'}
                        textStyle={{...styles.actionText, fontWeight: 'bold'}}
                        onPress={onSubmit}
                        disabled={!readyToSubmit()}
                        hitSlop={30}
                    />
                </View>
            </BlurView>
        </>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    titleContainer: {
        marginBottom: 25,
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        flex: 1,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    repeatSwitchContainer: {
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    numberInput: {
        backgroundColor: '#8888',
        padding: 5,
        minWidth: 30,
        color: 'white',
        textAlign: 'center',
    },
    androidPickerItem: {
        backgroundColor: '#333',
    },
    keyboardAttachedView: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: 0,
        width: '100%',
    },
    actionContainer: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 20,
    }
});

export default EventInput;