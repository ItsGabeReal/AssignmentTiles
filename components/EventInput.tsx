/**
 * The input interface for creating or editing an event.
 */

import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
} from 'react-native';
import CompactDatePicker from './core/input/CompactDatePicker';
import TextInputWithClearButton from './core/input/TextInputWithClearButton';
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { colorTheme, fontSizes, globalStyles } from '../src/GlobalStyles';
import { focusTextInput } from '../src/helpers/GlobalHelpers';
import { generalStateActions } from '../src/redux/features/general/generalSlice';
import { EventDetails } from '../types/store-current';
import InputField from './InputField';
import BlurView from './core/wrappers/BlurView';
import { deleteEventAndBackup, restoreDeletedEventsFromBackup } from '../src/helpers/EventHelpers';
import HideableView from './core/views/HideableView';
import Checkbox from './core/input/Checkbox';
import { RGBAColor, RGBAToColorValue, gray, green, mixColor, red, white } from '../src/helpers/ColorHelpers';
import DropdownMenu, { DropdownMenuRef } from './core/dropdown/DropdownMenu';
import CategoryPickerDropdown from './CategoryPickerDropdown';
import PressOutView, { PressOutViewRef } from './core/views/PressOutView';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import { EventRegister } from 'react-native-event-listeners';
import Button from './Button';
import { deleteCategoryAndBackup, restoreCategoryFromBackup } from '../src/helpers/CategoriesHelpers';

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
    const suggestedDate = useRef<DateYMD | null>(null); // Used to store the day row that was tapped when creating an event

    // Component references
    const pressOutViewRef = useRef<PressOutViewRef | null>(null);
    const eventNameInputRef = useRef<TextInput>(null);
    const dropdownMenuRef = useRef<DropdownMenuRef | null>(null);
    const categoryInputRef = useRef<CategoryInputRef | null>(null);


    useImperativeHandle(ref, () => ({
        open(params) {
            // Setup
            pressOutViewRef.current?.open();
            mode.current = params.mode;
            initializeInputs();

            if (params.mode === 'create') {
                // Initialize input from memorized input
                setEventNameInput(memorizedEventInput.name);
                setCategoryInput(memorizedEventInput.categoryID);
                setDeadlineSwitchInput(memorizedEventInput.deadlineEnabled);
                suggestedDate.current = params.suggestedDueDate || DateYMDHelpers.today();
                setDueDateInput(DateYMDHelpers.toDate(suggestedDate.current));
                setTimeout(() => eventNameInputRef.current?.focus(), 100); // Highlight the text that's in the name input
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

            EventRegister.emit('hideUndoPopup');
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

    function getCategoryColor(): RGBAColor {
        if (!categoryInput || categories[categoryInput] === undefined) return gray;

        return categories[categoryInput].color;
    }

    // Returns the category color, but slightly darker and transparent
    function getBackgroundColor() {
        const output = mixColor(getCategoryColor(), gray, 0.6);

        output.a = 225;
        
        return RGBAToColorValue(output);
    }

    function getCategoryTextColor() {
        const output = mixColor(getCategoryColor(), white);

        return RGBAToColorValue(output);
    }

    function getCategoryName() {
        if (!categoryInput) return 'None';
        if (categories[categoryInput] === undefined) return 'undefined';

        return categories[categoryInput].name;
    }

    // Determines whether the "create event" button is enabled or disabled
    function readyToCreate(): boolean {
        return eventNameInput.trim().length > 0;
    }

    function onCategorySelected(categoryID: string | null) {
        setCategoryInput(categoryID);
        dropdownMenuRef.current?.close();
    }

    function onCategoryInputSubmit(categoryID: string, mode: 'create' | 'edit') {
        if (mode === 'create') {
            setCategoryInput(categoryID);
        }
    }

    function deleteCategory(categoryID: string) {
        deleteCategoryAndBackup(dispatch, categoryID);
        EventRegister.emit('showUndoPopup', { action: 'Category Deleted', onPressed: ()=>{restoreCategoryFromBackup(dispatch)} });

        // Handle edge case where tile was using the deleted category
        if (categoryID === categoryInput) {
            setCategoryInput(null);
        }

        // Handle edge case where the deleted category is in memorized input
        if (memorizedEventInput.categoryID === categoryID) {
            dispatch(generalStateActions.updateMemorizedEventInput({categoryID: null}));
        }
    }

    function enterMultiselectMode() {
        dispatch(generalStateActions.setMultiselectEnabled({ enabled: true }));
        dispatch(generalStateActions.toggleEventIDSelected({ eventID: editedEventID.current }));
        close();
    }

    function onDeleted() {
        deleteEventAndBackup(dispatch, editedEventID.current);
        EventRegister.emit('showUndoPopup', { action: 'Event Deleted', onPressed: ()=>{restoreDeletedEventsFromBackup(dispatch)} });
        pressOutViewRef.current?.close();
    }

    function close() {
        if (mode.current === 'edit') {
            const originalDetails = events[editedEventID.current].details;

            const newName = eventNameInput.trim();
            const newDetails: EventDetails = {
                name: newName.length > 0 ? newName : originalDetails.name,
                dueDate: deadlineSwitchInput ? DateYMDHelpers.fromDate(dueDateInput) : null,
                categoryID: categoryInput,
                notes: notesInput.trim(),
            };

            // Don't submit unless something's actually changed
            const nameChanged = newDetails.name !== originalDetails.name;
            const categoryChanged = newDetails.categoryID !== originalDetails.categoryID;
            const dueDateChanged = !DateYMDHelpers.datesEqual(newDetails.dueDate, originalDetails.dueDate);
            if (nameChanged || categoryChanged || dueDateChanged) {
                props.onSubmit({
                    mode: 'edit',
                    details: newDetails,
                    editedEventID: editedEventID.current
                });
                
                dispatch(generalStateActions.updateMemorizedEventInput({ name: newDetails.name, categoryID: newDetails.categoryID, deadlineEnabled: deadlineSwitchInput }));

            }
        }

        EventRegister.emit('hideUndoPopup');

        pressOutViewRef.current?.close();
    }

    function createEvent() {
        const details: EventDetails = {
            name: eventNameInput.trim(),
            dueDate: deadlineSwitchInput ? DateYMDHelpers.fromDate(dueDateInput) : null,
            categoryID: categoryInput,
            notes: notesInput.trim(),
        };

        const repeatSettings: RepeatSettings = {
            interval: intervalInput,
            recurrences: recurrencesInput,
        }

        props.onSubmit({
            mode: 'create',
            details,
            plannedDate: suggestedDate.current || DateYMDHelpers.fromDate(dueDateInput),
            repeatSettings
        });

        dispatch(generalStateActions.updateMemorizedEventInput({ name: details.name, categoryID: details.categoryID, deadlineEnabled: deadlineSwitchInput }));
    }

    return (
        <>
            <PressOutView ref={pressOutViewRef} style={styles.mainContainer} onClose={close}>
                <BlurView
                    borderRadius={20}
                    blurType={colorTheme}
                    style={{ backgroundColor: getBackgroundColor(), ...styles.fieldsContainer }}
                    onStartShouldSetResponder={() => true} // Absorb touch events. This prevents event input from closing when box is tapped
                >
                    <InputField title='Name' style={styles.topInputField} onPress={() => focusTextInput(eventNameInputRef)}>
                        <TextInputWithClearButton
                            ref={eventNameInputRef}
                            value={eventNameInput}
                            onChangeText={setEventNameInput}
                            autoFocus={mode.current === 'edit'}
                            selectTextOnFocus={mode.current !== 'edit'} // Don't autoselect text in edit mode
                            style={styles.nameTextInput}
                            closeButtonColor='white'
                            textAlign='center'
                            maxLength={50}
                        />
                    </InputField>
                    <InputField title='Category' style={styles.middleInputField}>
                        <DropdownMenu
                            ref={dropdownMenuRef}
                            dropIconColor={'white'}
                            content={
                                <View style={styles.dropdownOverflowHider}>
                                    <CategoryPickerDropdown
                                        onCategorySelected={onCategorySelected}
                                        onCreateCategory={() => {
                                            categoryInputRef.current?.open({ mode: 'create' });
                                            dropdownMenuRef.current?.close();
                                        }}
                                        onEditCategory={categoryID => {
                                            categoryInputRef.current?.open({ mode: 'edit', categoryID });
                                            dropdownMenuRef.current?.close();
                                        }}
                                    />
                                </View>
                            }
                            contentContainerStyle={styles.categoryDropdownContainer}
                            hitSlop={10}
                        >
                            <Text style={[styles.categoryText, { color: getCategoryTextColor() }]}>{getCategoryName()}</Text>
                        </DropdownMenu>
                    </InputField>
                    <InputField title='Deadline' style={styles.middleInputField} headerChildren={<Checkbox value={deadlineSwitchInput} onChange={setDeadlineSwitchInput} color='white' />}>
                        <HideableView hidden={!deadlineSwitchInput} style={globalStyles.flexRow}>
                            <Text style={styles.dueDateText}>Due Date</Text>
                            <CompactDatePicker value={dueDateInput} onChange={setDueDateInput} themeVariant='dark' />
                        </HideableView>
                    </InputField>
                    <InputField title='Notes' style={styles.bottomInputField}>
                        <TextInput value={notesInput} onChangeText={setNotesInput} placeholder='Add notes here...' placeholderTextColor='#ffffff40' style={{ color: 'white', padding: 0, maxHeight: 100 }} multiline maxLength={500} />
                    </InputField>
                </BlurView>
                {mode.current === 'create' ?
                    <>
                        <Button
                            title='Create'
                            titleSize={20}
                            iconName='add-box'
                            iconSize={30}
                            fontColor={white}
                            backgroundColor={green}
                            onPress={() => { createEvent(); close(); }}
                            style={[styles.createButton, globalStyles.dropShadow]}
                            disabled={!readyToCreate()}
                        />
                        {/*<Button
                            title='Create Multiple'
                            titleSize={13}
                            iconName='library-add'
                            fontColor={{r:255,g:255,b:255,a:220}}
                            backgroundColor={{r:192,g:192,b:0,a:230}}
                            onPress={() => { createEvent(); close(); }}
                            style={{marginTop: 12, borderRadius: 15 }}
                        />*/}
                    </>
                :
                    <View style={[globalStyles.flexRow, { marginTop: 12 }]}>
                        <Button
                            title='Select'
                            titleSize={12}
                            iconName='check-box'
                            iconSize={24}
                            fontColor={{r:255,g:255,b:255,a:224}}
                            backgroundColor={{r:0,g:60,b:210,a:255}}
                            onPress={enterMultiselectMode}
                            style={[styles.selectButton, globalStyles.dropShadow]}
                        />
                        <Button
                            title='Delete'
                            titleSize={12}
                            iconName='delete'
                            iconSize={24}
                            fontColor={{r:255,g:255,b:255,a:224}}
                            backgroundColor={red}
                            onPress={onDeleted}
                            style={[styles.deleatButton, globalStyles.dropShadow]}
                        />
                    </View>
                }
            </PressOutView>
            <CategoryInput ref={categoryInputRef} onSubmit={onCategoryInputSubmit} onDelete={deleteCategory} />
        </>
    )
});

const styles = StyleSheet.create({
    mainContainer: {
        alignItems: 'center'
    },
    fieldsContainer: {
        alignItems: 'center',
        padding: 30
    },
    topInputField: {
        marginBottom: 20,
        width: 275
    },
    middleInputField: {
        marginBottom: 20,
        width: 215
    },
    bottomInputField: {
        width: 250
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
    },
    dropdownOverflowHider: {
        borderRadius: 10,
        overflow: 'hidden',

        // Android's elevation shadow won't work in categoryDropdownContainer for some reason, so this is the workaround
        backgroundColor: '#333',
        elevation: 4,
    },
    categoryDropdownContainer: {
        backgroundColor: '#333',
        borderRadius: 10,
        maxHeight: 250,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dueDateText: {
        color: 'white',
        marginRight: 8
    },
    createButton: {
        marginTop: 12,
        borderRadius: 20,
        width: 200,
        padding: 16
    },
    selectButton: {
        borderRadius: 15
    },
    deleatButton: {
        marginLeft: 12,
        borderRadius: 15
    },
});

export default EventInput;
