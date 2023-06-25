import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Button,
    TextInput,
    ScrollView,
    Switch,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import AndroidCompactDatePicker from './core/AndroidCompactDatePicker';
import IosStyleButton from './core/IosStyleButton';
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import { CategoryID, EventDetails } from '../types/EventTypes';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import { generalStyles, textStyles } from '../src/GlobalStyles';
import CategoryEditor from './CategoryEditor';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import NumberInput from './core/NumberInput';
import HideableView from './core/HideableView';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import StdText from './StdText';
import { memorizedInputActions } from '../src/redux/features/memorizedInput/memorizedInputSlice';
import TextInputWithClearButton from './core/TextInputWithClearButton';

export type RepeatSettings = {
    /**
     * Defines the unit of time in value property.
     */
    valueType: RepeatValueType;

    /**
     * The quantity of time units as defined by the valueType property.
     */
    value: number;

    /**
     * Number of times the event should occur.
     */
    recurrences: number;
}

export type RepeatValueType = 'days' | 'weeks' | 'months';

type DueType = 'none' | 'before-date';

type EventInputProps = {
    /**
     * The name to be autofilled when the component is created.
     */
    initialName?: string;

    /**
     * The due date to be autofilled when the component is created.
     */
    initialDueDate?: DateYMD | null;

    /**
     * The id of the category to be autofilled when the component is created.
     */
    initialCategoryID?: CategoryID;

    /**
     * Changes the visuals and behavior of text input.
    */
    mode: 'create' | 'edit';
    
    /**
        * Called when the event is submitted (created or edited).
    */
    onSubmit: ((eventDetails: EventDetails, repeatSettings: RepeatSettings | null) => void);

    visible: boolean;

    /**
     * Called when the modal wants to close. Should set visible to false.
     */
    onRequestClose: (() => void);
}

const EventInput: React.FC<EventInputProps> = (props) => {
    const categories = useAppSelector(state => state.categories);
    const dispatch = useAppDispatch();

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
        if (props.mode !== 'edit') {
            /*
            * There's a bug on android where enabling autofocus on text
            * inputs doesn't automatically show the keyboard.
            * This fixes that.
            */
            setTimeout(() => { eventNameInputRef.current?.focus(); }, 100);
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

            dispatch(memorizedInputActions.updateMemorizedEventInput({name: details.name, categoryID: details.categoryID}));
        }
    }

    return (
        <>
            <CategoryInput ref={categoryInputRef} mode='create' onCategoryCreated={category => setSelectedCategory(category.id || 'none')} />
            <CategoryEditor ref={categoryEditorRef} />
            <View style={styles.mainContainer}>
                <View style={styles.titleContainer}>
                    <StdText type='title'>{props.mode === 'edit' ? 'Edit Assignment' : 'Create Assignment'}</StdText>
                </View>
                <ScrollView
                    style={styles.inputContainer}
                    keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps="handled"
                >
                    <StdText style={generalStyles.fieldDescription}>Name:</StdText>
                    <TextInputWithClearButton
                        ref={eventNameInputRef}
                        defaultValue={props.initialName}
                        //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                        onChangeText={setEventNameInput}
                        selectTextOnFocus={props.mode !== 'edit'} // Don't autoselect text in edit mode
                        textInputStyle={[textStyles.p, {padding: 0}]}
                        containerStyle={generalStyles.parameterContainer}
                        closeButtonColor='white'
                        keyboardAppearance='dark'
                    />
                    <StdText style={generalStyles.fieldDescription}>Due:</StdText>
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
                                <StdText>Repeats:</StdText>
                                <Switch value={repeatSwitchValue} onValueChange={setRepeatSwitchValue} style={{ marginLeft: 10 }} />
                            </View>
                            <HideableView hidden={!repeatSwitchValue}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <StdText>Every </StdText>
                                    <NumberInput
                                        minimimValue={1}
                                        defaultValue={7}
                                        onChangeNumber={setRepeatValueInput}
                                        style={generalStyles.numberInput}
                                    />
                                    <StdText> days</StdText>
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                                    <StdText>End after </StdText>
                                    <NumberInput
                                        minimimValue={2}
                                        onChangeNumber={setRepeatRecurrences}
                                        style={generalStyles.numberInput}
                                    />
                                    <StdText> recurrences</StdText>
                                </View>
                            </HideableView>
                        </HideableView>
                    </View>
                    <StdText style={generalStyles.fieldDescription}>Category:</StdText>
                    <View style={[generalStyles.parameterContainer, { padding: 0, overflow: 'hidden' }]}>
                        <Picker
                            selectedValue={selectedCategory}
                            onValueChange={setSelectedCategory}
                            mode='dropdown'
                            dropdownIconColor='white'
                        >
                            <Picker.Item key='none' label='None' value='none' color='#bbb' />
                            {categories.map(item => (
                                <Picker.Item key={item.id} label={item.name} value={item.id} color={item.color} />
                                ))}
                        </Picker>
                    </View>
                    <Button title='New Category' onPress={() => categoryInputRef.current?.open()} />
                    <Button title='Edit Categories' onPress={() => categoryEditorRef.current?.open()} />
                </ScrollView>
            </View>
            <View style={styles.keyboardAttachedView}>
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
                        title={props.mode === 'edit' ? 'Save' : 'Create'}
                        textStyle={{...styles.actionText, fontWeight: 'bold'}}
                        onPress={onSubmit}
                        disabled={!readyToSubmit()}
                        hitSlop={30}
                    />
                </View>
            </View>
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
    keyboardAttachedView: {
        flexDirection: 'row',
        bottom: 0,
        width: '100%',
        backgroundColor: '#000'
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