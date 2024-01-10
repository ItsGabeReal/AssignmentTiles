/**
 * The input interface for creating or editing an event.
 */

import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Switch,
    Pressable,
    ColorValue,
    TouchableOpacity
} from 'react-native';
import CompactDatePicker from './core/CompactDatePicker';
import NumberInput from './core/NumberInput';
import TextInputWithClearButton from './core/TextInputWithClearButton';
import ViewWithBackHandler from './core/ViewWithBackHandler';
import CategoryPicker, { CategoryPickerRef } from './CategoryPicker';
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { activeOpacity, colorTheme, colors, fontSizes, globalStyles } from '../src/GlobalStyles';
import { focusTextInput } from '../src/GlobalHelpers';
import { generalStateActions } from '../src/redux/features/general/generalSlice';
import { EventDetails, Event } from '../types/store-current';
import InputField from './InputField';
import BlurView from './core/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { deleteEventAndBackup } from '../src/EventHelpers';
import HideableView from './core/HideableView';
import Checkbox from './core/Checkbox';
import { lightenColor, mixColor } from '../src/ColorHelpers';

export type RepeatSettings = {
    /**
     * The quantity of time units as defined by the valueType property.
     */
    interval: number;

    /**
     * Number of times the event should occur.
     */
    recurrences: number;
}

type OpenEventInputParams = {mode: "create", suggestedDueDate?: DateYMD} | {mode: "edit", eventID: string};

export type EventInputRef = {
    /**
     * Opens the event input box in either create mode or edit mode.
     * 
     * In create mode, the name and category fields are autofilled based on the
     * last edited event, and the due date is set from suggestedDueDate (leave
     * undefined for no due date).
     * 
     * In edit mode, all fields are autofilled based on the provided event id.
     * 
     * @example 
     * // Creating an event
     * eventInputRef.open({ mode: 'create', suggestedDueDate: DateYDM })
     * 
     * // Editing an event
     * eventInputRef.open({ mode: 'edit', event: Event, eventID: string })
     */
    open: ((params: OpenEventInputParams) => void);
}

export type OnEventInputSubmitParams =
    { mode: 'create', details: EventDetails, plannedDate: DateYMD, repeatSettings: RepeatSettings | null}
    | { mode: 'edit', details: EventDetails, editedEventID: string };

type EventInputProps = {
    /**
     * Called when the event is submitted (created or edited).
     */
    onSubmit: ((params: OnEventInputSubmitParams) => void);
}

const EventInput = forwardRef<EventInputRef, EventInputProps>((props, ref) => {
    const categories = useAppSelector(state => state.categories.current);
    const events = useAppSelector(state => state.events.current); // Lets us access event data when editing. May not be the most efficient, but should be fine
    const memorizedEventInput = useAppSelector(state => state.general.memorizedEventInput);
    const dispatch = useAppDispatch();

    // Opens/closes event input
    const [enabled, setEnabled] = useState(false);

    // Input variables
    const [eventNameInput, setEventNameInput] = useState('');
    const [categoryInput, setCategoryInput] = useState<string | null>(null);
    const [deadlineSwitchInput, setDeadlineSwitchInput] = useState(false);
    const [dueDateInput, setDueDateInput] = useState(new Date());
    const [repeatSwitchInput, setRepeatSwitchInput] = useState(false);
    const [recurrencesInput, setRecurrencesInput] = useState(2);
    const [intervalInput, setIntervalInput] = useState(7);
    const [notesInput, setNotesInput] = useState('');

    // Non-input variables
    const mode = useRef<'create' | 'edit'>('create');
    const editedEventID = useRef('');
    const suggestedDate = useRef<DateYMD>(DateYMDHelpers.today()); // Used to store the day row that was tapped when creating an event

    // Component references
    const eventNameInputRef = useRef<TextInput>(null);
    const categoryPickerRef = useRef<CategoryPickerRef | null>(null);


    useImperativeHandle(ref, () => ({
        open(params) {
            // Setup
            setEnabled(true);
            mode.current = params.mode;
            initializeInputs();

            if (params.mode === 'create') {
                // Initialize input from memorized input
                setEventNameInput(memorizedEventInput.name);
                setCategoryInput(memorizedEventInput.categoryID);
                setDeadlineSwitchInput(memorizedEventInput.deadlineEnabled);
                suggestedDate.current = params.suggestedDueDate || DateYMDHelpers.today();
                setDueDateInput(DateYMDHelpers.toDate(suggestedDate.current));
                autoFocusNameInput();
            }
            else {
                // Initialize input from provided event id
                const event = events[params.eventID];
                if (!event) {
                    console.error('EventInput -> open: Error editing event. Event id does not exist.');
                    return;
                }

                setEventNameInput(event.details.name);
                setCategoryInput(event.details.categoryID);
                setDeadlineSwitchInput(event.details.dueDate !== null);
                setDueDateInput(DateYMDHelpers.toDate(event.details.dueDate || DateYMDHelpers.today()));
                setNotesInput(event.details.notes);
                editedEventID.current = params.eventID;
            }
        }
    }));

    // Initialize inputs to their default values
    function initializeInputs() {
        setEventNameInput('');
        setCategoryInput(null);
        setDeadlineSwitchInput(false);
        setDueDateInput(new Date());
        setRepeatSwitchInput(false);
        setRecurrencesInput(2);
        setIntervalInput(7);
        setNotesInput('');
    }

    function autoFocusNameInput() {
        /**
         * Note: There's a bug on android where enabling autofocus
         * on text inputs doesn't automatically show the keyboard.
         * This is fixed by calling focus after a short timeout.
         */
        setTimeout(() => { eventNameInputRef.current?.focus(); }, 100);
    }

    function getCategoryColor(): ColorValue {
        if (!categoryInput) return colors.dimText;

        return categories[categoryInput].color;
    }

    // Returns the category color, but slightly darker and transparent
    function getBackgroundColor() {
        const color = mixColor(getCategoryColor(), '#808080', 0.5);

        let colorStr = color.toString();

        if (colorStr.length === 7) {
            colorStr = colorStr + "B0";
        }
        else {
            console.error('EventInput -> getBackgroundColor: Could not create background color. Unknown color string format.');
        }
        
        return colorStr;
    }

    function getCategoryName() {
        if (!categoryInput) return 'None';

        return categories[categoryInput].name;
    }

    // Determines whether the "create event" button is enabled or disabled
    function readyToCreate(): boolean {
        return (eventNameInput.length > 0);
    }

    function submit() {
        const details: EventDetails = {
            name: eventNameInput,
            dueDate: deadlineSwitchInput ? DateYMDHelpers.fromDate(dueDateInput) : null,
            categoryID: categoryInput,
            notes: notesInput,
        };

        const repeatSettings: RepeatSettings = {
            interval: intervalInput,
            recurrences: recurrencesInput,
        }

        // Call onSubmit with the proper settings
        if (mode.current === 'create') {
            props.onSubmit({
                mode: 'create',
                details,
                plannedDate: DateYMDHelpers.fromDate(dueDateInput),
                repeatSettings
            });
        }
        else {
            props.onSubmit({
                mode: 'edit',
                details,
                editedEventID: editedEventID.current
            });
        }

        dispatch(generalStateActions.updateMemorizedEventInput({ name: details.name, categoryID: details.categoryID, deadlineEnabled: deadlineSwitchInput }));
    }

    // Handle edge cases regarding category deletion
    function handleCategoryDeleted(deletedCategoryID: string) {
        if (deletedCategoryID === categoryInput) {
            setCategoryInput(null);
        }

        /**
         * Set remembered category id to null.
         * This prevents event input from autofilling a category
         * that doesn't exist.
         */
        dispatch(generalStateActions.updateMemorizedEventInput({categoryID: null}));
    }

    // Closes the event input, and if in edit mode, those changes are submitted as well.
    function submitAndClose() {
        // If we're editing an event, we should submit on close
        if (mode.current === 'edit') {
            submit();
        }

        close();
    }

    function close() {
        setEnabled(false);
    }

    function onSelected() {
        dispatch(generalStateActions.setMultiselectEnabled({ enabled: true }));
        dispatch(generalStateActions.toggleEventIDSelected({ eventID: editedEventID.current }));
        submitAndClose();
    }

    function onDeleted() {
        deleteEventAndBackup(dispatch, editedEventID.current);
        close();
    }

    if (enabled) {
        return (
            <ViewWithBackHandler
                onRequestClose={submitAndClose}
                onStartShouldSetResponder={() => true} // Absorb touch events. This prevents event input from closing when box is tapped
                style={StyleSheet.absoluteFill}
            >
                <CategoryPicker ref={categoryPickerRef} onSelect={categoryID => setCategoryInput(categoryID)} onDelete={handleCategoryDeleted} />
                <Pressable onPress={submitAndClose} style={styles.pressOutContainer}>
                    <View style={styles.fieldsAndButtonsContainer}>
                        <BlurView
                            borderRadius={20}
                            blurType={colorTheme}
                            style={{ backgroundColor: getBackgroundColor(), ...styles.fieldsContainer }}
                            onStartShouldSetResponder={() => true}
                        >
                            <InputField title='Name' marginBottom={20} width={275} onPress={() => focusTextInput(eventNameInputRef)}>
                                <TextInputWithClearButton
                                    ref={eventNameInputRef}
                                    value={eventNameInput}
                                    //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                                    onChangeText={setEventNameInput}
                                    selectTextOnFocus={mode.current !== 'edit'} // Don't autoselect text in edit mode
                                    style={styles.nameTextInput}
                                    closeButtonColor='white'
                                    textAlign='center'
                                    maxLength={50}
                                />
                            </InputField>
                            <InputField title='Category' marginBottom={20} width={215} onPress={() => categoryPickerRef.current?.open()}>
                                <Text style={[styles.categoryText, { color: lightenColor(getCategoryColor(), 0.25) }]}>{getCategoryName()}</Text>
                            </InputField>
                            <InputField title='Deadline' marginBottom={20} width={215} headerChildren={<Checkbox value={deadlineSwitchInput} onChange={setDeadlineSwitchInput} color='white' />}>
                                <HideableView hidden={!deadlineSwitchInput} style={globalStyles.flexRow}>
                                    <Text style={{ color: 'white', marginRight: 8 }}>Due Date</Text>
                                    <CompactDatePicker value={dueDateInput} onChange={setDueDateInput} themeVariant='dark' />
                                </HideableView>
                            </InputField>
                            { mode.current === 'create' ?
                                <InputField title='Repeat' marginBottom={20} width={215} headerChildren={<Checkbox value={repeatSwitchInput} onChange={setRepeatSwitchInput} color='white' />} >
                                    <HideableView hidden={!repeatSwitchInput}>
                                        <View style={[globalStyles.flexRow, { marginBottom: 5 }]}>
                                            <Text style={{color: 'white'}}>Every </Text>
                                            <NumberInput
                                                value={intervalInput}
                                                onChangeNumber={setIntervalInput}
                                                minimimValue={1}
                                                maximumValue={999}
                                                style={[globalStyles.numberInput, {color: 'white'}]}
                                            />
                                            <Text style={{color: 'white'}}> days</Text>
                                        </View>
                                        <View style={globalStyles.flexRow}>
                                            <Text style={{color: 'white'}}>End after </Text>
                                            <NumberInput
                                                value={recurrencesInput}
                                                onChangeNumber={setRecurrencesInput}
                                                minimimValue={2}
                                                maximumValue={100}
                                                style={[globalStyles.numberInput, {color: 'white'}]}
                                            />
                                            <Text style={{color: 'white'}}> occurrences</Text>
                                        </View>
                                    </HideableView>
                                </InputField>
                            :
                                null
                            }
                            <InputField title='Notes' width={250}>
                                <TextInput value={notesInput} onChangeText={setNotesInput} placeholder='Add notes here...' placeholderTextColor='#ffffff40' style={{ color: 'white', padding: 0, maxHeight: 100 }} multiline maxLength={500} />
                            </InputField>
                        </BlurView>
                        {mode.current === 'create' ?
                            <>
                                <TouchableOpacity activeOpacity={activeOpacity} onPress={() => { submit(); close(); }} style={{ marginTop: 12 }}>
                                    <BlurView borderRadius={15} blurType={colorTheme} style={{ backgroundColor: '#00E000A0', width: 225, padding: 16, justifyContent: 'center', ...globalStyles.flexRow }}>
                                        <Icon name='add-box' color='white' size={30} />
                                        <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold', color: 'white' }}>Create</Text>
                                    </BlurView>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={activeOpacity} onPress={() => { submit(); close(); }} style={{ marginTop: 12 }}>
                                    <BlurView borderRadius={15} blurType={colorTheme} style={{ backgroundColor: '#C0C000A0', padding: 10, ...globalStyles.flexRow }}>
                                        <Icon name='library-add' color='#FFFFFFB0' size={22} />
                                        <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: 'bold', color: '#FFFFFFB0' }}>Create Multiple</Text>
                                    </BlurView>
                                </TouchableOpacity>
                            </>
                            
                        :
                            <View style={[globalStyles.flexRow, { marginTop: 12 }]}>
                                <TouchableOpacity activeOpacity={activeOpacity} onPress={onSelected}>
                                    <BlurView borderRadius={15} blurType={colorTheme} style={{ backgroundColor: '#0040FF60', padding: 12, ...globalStyles.flexRow }}>
                                        <Icon name='check-box' color='#FFFFFFE0' size={24} />
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFFE0', marginLeft: 8 }}>Select</Text>
                                    </BlurView>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={activeOpacity} onPress={onDeleted} style={{ marginLeft: 12 }}>
                                    <BlurView borderRadius={15} blurType={colorTheme} style={{ backgroundColor: '#FF000060', padding: 12, ...globalStyles.flexRow }}>
                                        <Icon name='delete' color='#FFFFFFE0' size={24} />
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFFE0', marginLeft: 8 }}>Delete</Text>
                                    </BlurView>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </Pressable>
            </ViewWithBackHandler>
        )
    }
    else return null;
});

const styles = StyleSheet.create({
    pressOutContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00000040'
    },
    fieldsAndButtonsContainer: {
        alignItems: 'center'
    },
    fieldsContainer: {
        alignItems: 'center',
        padding: 30
    },
    nameTextInput: {
        flex: 1,
        fontSize: fontSizes.h1,
        padding: 0,
        color: 'white'
    },
    categoryText: {
        fontSize: fontSizes.h2,
        padding: 0,
        textAlign: 'center'
    }
});

export default EventInput;
