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
import { focusTextInput, lightenColor, darkenColor } from '../src/GlobalHelpers';
import { generalStateActions } from '../src/redux/features/general/generalSlice';
import { EventDetails, Event } from '../types/store-current';
import InputField from './InputField';
import BlurView from './core/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { deleteEventAndBackup } from '../src/EventHelpers';
import HideableView from './core/HideableView';
import Checkbox from './core/Checkbox';

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
    { mode: 'create', eventDetails: EventDetails, repeatSettings: RepeatSettings | null}
    | { mode: 'edit', editedEventID: string, event: Event, repeatSettings: RepeatSettings | null };

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

    const [enabled, setEnabled] = useState(false);

    const [eventNameInput, setEventNameInput] = useState('');
    const [categoryInput, setCategoryInput] = useState<string | null>(null);
    const [deadlineSwitchInput, setDeadlineSwitchInput] = useState(false);
    const [dueDateInput, setDueDateInput] = useState(new Date());
    const [repeatSwitchInput, setRepeatSwitchInput] = useState(false);
    const [recurrencesInput, setRecurrencesInput] = useState(2);
    const [intervalInput, setIntervalInput] = useState(7);
    const [notesInput, setNotesInput] = useState('');
    const [completedInput, setCompletedInput] = useState(false);
    const eventNameInputRef = useRef<TextInput>(null);
    const categoryPickerRef = useRef<CategoryPickerRef | null>(null);
    const mode = useRef<'create' | 'edit'>('create');
    const editedEventID = useRef('');


    useImperativeHandle(ref, () => ({
        open(params) {
            setEnabled(true);
            mode.current = params.mode;

            if (params.mode === 'create') {
                // Initialize input from memorized input
                initializeInputs(memorizedEventInput.name, memorizedEventInput.categoryID, params.suggestedDueDate);

                /*
                 * Auto-focus keyboard.
                 * 
                 * Note: There's a bug on android where enabling autofocus
                 * on text inputs doesn't automatically show the keyboard.
                 * This is fixed by calling focus after a short timeout.
                 */
                setTimeout(() => { eventNameInputRef.current?.focus(); }, 100);
            }
            else {
                // Initialize input from provided event id
                const event = events[params.eventID];
                if (!event) {
                    console.error('EventInput -> open: Error editing event. Event id does not exist.');
                    return;
                }

                initializeInputs(
                    event.details.name,
                    event.details.categoryID,
                    event.details.dueDate,
                    event.details.notes,
                    event.completed);

                editedEventID.current = params.eventID;
            }
        }
    }));

    function initializeInputs(name: string, categoryID: string | null, dueDate?: DateYMD | null, notes?: string, completed?: boolean) {
        setEventNameInput(name);
        setCategoryInput(categoryID);
        setNotesInput(notes || '');
        setCompletedInput(completed || false);
        if (dueDate) {
            setDeadlineSwitchInput(true);
            setDueDateInput(DateYMDHelpers.toDate(dueDate));
        }
        else
            setDeadlineSwitchInput(false);

        // Defaults
        setRepeatSwitchInput(false);
        setRecurrencesInput(2);
        setIntervalInput(7);
    }

    function getCategoryColor(): ColorValue {
        if (!categoryInput) return colors.dimText;

        return categories[categoryInput].color;
    }

    // Returns the category color, but slightly darker and transparent
    function getBackgroundColor() {
        const color = getCategoryColor();

        let colorStr = colorTheme === 'dark' ? darkenColor(color, 0.4) : darkenColor(color, 0.1);

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
                eventDetails: details,
                repeatSettings
            });
        }
        else {
            props.onSubmit({
                mode: 'edit',
                editedEventID: editedEventID.current,
                event: {
                    details,
                    completed: completedInput
                },
                repeatSettings
            });
        }

        dispatch(generalStateActions.updateMemorizedEventInput({ name: details.name, categoryID: details.categoryID }));
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
                            <InputField title='Name' marginBottom={20} width={300} onPress={() => focusTextInput(eventNameInputRef)}>
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
                            <InputField title='Category' marginBottom={20} width={225} onPress={() => categoryPickerRef.current?.open()}>
                                <Text style={[styles.categoryText, { color: colorTheme === 'dark' ? getCategoryColor() : lightenColor(getCategoryColor(), 0.25) }]}>{getCategoryName()}</Text>
                            </InputField>
                            <InputField title='Deadline' marginBottom={20} width={225} headerChildren={<Checkbox value={deadlineSwitchInput} onChange={setDeadlineSwitchInput} color='white' />}>
                                <HideableView hidden={!deadlineSwitchInput} style={globalStyles.flexRow}>
                                    <Text style={{ color: 'white', marginRight: 8 }}>Due Date</Text>
                                    <CompactDatePicker value={dueDateInput} onChange={setDueDateInput} themeVariant='dark' />
                                </HideableView>
                            </InputField>
                            <InputField title='Repeat' marginBottom={20} width={225} headerChildren={<Checkbox value={repeatSwitchInput} onChange={setRepeatSwitchInput} color='white' />} >
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
                            <InputField title='Notes' width={260}>
                                <TextInput value={notesInput} onChangeText={setNotesInput} placeholder='Add notes here...' placeholderTextColor='#ffffff40' style={{ color: 'white', padding: 0, maxHeight: 100 }} multiline maxLength={500} />
                            </InputField>
                        </BlurView>
                        {mode.current === 'create' ?
                            <TouchableOpacity activeOpacity={activeOpacity} onPress={() => { submit(); close(); }} style={{ marginTop: 12 }}>
                                <BlurView borderRadius={100} blurType={colorTheme} style={{ backgroundColor: '#00FF0080', padding: 12, ...globalStyles.flexRow }}>
                                    <Icon name='add' color='white' size={30} />
                                    <Text style={{ marginLeft: 8, fontSize: 18, fontWeight: 'bold', color: 'white' }}>Create Assignment</Text>
                                </BlurView>
                            </TouchableOpacity>
                        :
                            <>
                                <TouchableOpacity activeOpacity={activeOpacity} onPress={() => setCompletedInput(!completedInput)} style={{marginTop: 12, width: 200}}>
                                    <BlurView borderRadius={20} blurType={colorTheme} style={{backgroundColor: completedInput ? '#00FF0080' : '#60606080', padding: 15, justifyContent: 'center', ...globalStyles.flexRow}}>
                                        <Icon name={completedInput ? 'check-circle-outline' : 'radio-button-unchecked'} color='#FFFFFFB0' size={30} />
                                        <Text style={{marginLeft: 24, fontSize: 18, fontWeight: 'bold', color: '#FFFFFFB0'}}>Complete</Text>
                                    </BlurView>
                                </TouchableOpacity>
                                <View style={[globalStyles.flexRow, {marginTop: 12}]}>
                                    <TouchableOpacity activeOpacity={activeOpacity} onPress={onSelected}>
                                        <BlurView borderRadius={12} blurType={colorTheme} style={{backgroundColor: '#0040FF80', width: 60, height: 60, alignItems: 'center', justifyContent: 'center'}}>
                                            <Text style={{fontSize: 12, fontWeight: 'bold', color: '#FFFFFFB0'}}>Select</Text>
                                            <Icon name='check-box' color='#FFFFFFB0' size={24} />
                                        </BlurView>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={activeOpacity} onPress={onDeleted} style={{marginLeft: 12}}>
                                        <BlurView borderRadius={12} blurType={colorTheme} style={{backgroundColor: '#FF000080', width: 60, height: 60, alignItems: 'center', justifyContent: 'center'}}>
                                            <Text style={{fontSize: 12, fontWeight: 'bold', color: '#FFFFFFB0'}}>Delete</Text>
                                            <Icon name='delete' color='#FFFFFFB0' size={24} />
                                        </BlurView>
                                    </TouchableOpacity>
                                </View>
                            </>
                        }
                    </View>
                </Pressable>
            </ViewWithBackHandler>
        )
    }
    else return null;
    
    /*return (
        <>
            <CategoryPicker ref={categoryPickerRef} onSelect={categoryID => setCategoryInput(categoryID)} onDelete={handleCategoryDeleted} />
            <View style={styles.fieldsContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>{props.mode === 'edit' ? 'Edit Assignment' : 'Add Assignment'}</Text>
                    <IosStyleButton
                        title='Cancel'
                        color='#888'
                        textStyle={styles.cancelButtonText}
                        onPress={props.onRequestClose}
                        hitSlop={20}
                    />
                    <IosStyleButton
                        title={props.mode === 'edit' ? 'Save' : 'Done'}
                        textStyle={styles.submitButtonText}
                        containerStyle={styles.submitButtonContainer}
                        onPress={onSubmit}
                        disabled={!readyToSubmit()}
                        hitSlop={20}
                    />
                </View>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.inputContainer}
                    //keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps="handled"
                >
                    <Pressable style={[globalStyles.parameterContainer, globalStyles.flexRow]} onPress={() => focusTextInput(eventNameInputRef)}>
                        <Text style={globalStyles.fieldDescription}>Name:</Text>
                        <TextInputWithClearButton
                            ref={eventNameInputRef}
                            defaultValue={props.initialName}
                            //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                            onChangeText={setEventNameInput}
                            selectTextOnFocus={mode.current !== 'edit'} // Don't autoselect text in edit mode
                            textInputStyle={styles.eventNameInput}
                            containerStyle={styles.eventNameContainer}
                        />
                    </Pressable>
                    <Pressable style={[globalStyles.parameterContainer, globalStyles.flexRow]} onPress={() => categoryPickerRef.current?.open()}>
                        <Text style={globalStyles.fieldDescription}>Category:</Text>
                        <Text style={[styles.categoryText, {color: getCategoryColor()}]}>{getCategoryName()}</Text>
                    </Pressable>
                    <View style={globalStyles.parameterContainer}>
                        <Text style={globalStyles.fieldDescription}>Due:</Text>
                        <DotPicker
                            options={[
                                {
                                    value: 'none',
                                    displayName: 'None',
                                    containerStyle: styles.dotPickerOption,
                                },
                                {
                                    value: 'before-date',
                                    displayName: 'Before Date:',
                                    containerStyle: [styles.dotPickerOption, globalStyles.flexRow],
                                    children: <CompactDatePicker value={dueDateInput} onChange={onDateChanged} style={styles.datePickerContainer} />,
                                },
                            ]}
                            onChange={setDueTypeInput}
                            style={styles.recessedView}
                            textStyle={styles.dotPickerText}
                            initialValue={dueTypeInput}
                            hitSlop={10}
                        />
                    </View>
                    <HideableView hidden={dueTypeInput !== 'before-date'} style={globalStyles.parameterContainer}>
                        <View style={globalStyles.flexRow}>
                            <Text style={globalStyles.fieldDescription}>Repeat:</Text>
                            <Switch value={repeatSwitchValue} onValueChange={setRepeatSwitchValue} />
                        </View>
                        <HideableView hidden={!repeatSwitchValue} style={styles.recessedView}>
                            <View style={styles.repeatOptions}>
                                <Text style={styles.regularText}>Every </Text>
                                <NumberInput
                                    minimimValue={1}
                                    maximumValue={9999}
                                    defaultValue={7}
                                    onChangeNumber={setRepeatValueInput}
                                    style={globalStyles.numberInput}
                                />
                                <Text style={styles.regularText}> days</Text>
                            </View>
                            <View style={styles.repeatOptions}>
                                <Text style={styles.regularText}>End after </Text>
                                <NumberInput
                                    minimimValue={2}
                                    maximumValue={100}
                                    onChangeNumber={setRepeatRecurrences}
                                    style={globalStyles.numberInput}
                                />
                                <Text style={styles.regularText}> occurrences</Text>
                            </View>
                        </HideableView>
                    </HideableView>
                    <View style={globalStyles.parameterContainer}>
                        <Text style={globalStyles.fieldDescription}>Notes:</Text>
                        <View style={styles.notesInputContainer}>
                            <TextInput
                                style={styles.notesInput}
                                multiline
                                defaultValue={notesInput.current}
                                onChangeText={newText => { notesInput.current = newText }}
                                placeholderTextColor={colors.dimText}
                                onFocus={() => scrollViewRef.current?.scrollToEnd()}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );*/
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

/*const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerContainer: {
        marginBottom: 25,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: colors.text,
        fontSize: fontSizes.title,
        fontWeight: 'bold',
    },
    cancelButtonText: {
        fontSize: fontSizes.h2,
    },
    submitButtonText: {
        fontSize: fontSizes.h2,
        fontWeight: 'bold',
    },
    submitButtonContainer: {
        marginLeft: 'auto',
    },
    inputContainer: {
        flex: 1,
    },
    eventNameInput: {
        fontSize: fontSizes.p,
        color: colors.text,
        padding: 0,
    },
    eventNameContainer: {
        flex: 1,
    },
    categoryText: {
        fontSize: fontSizes.h2,
    },
    recessedView: {
        marginLeft: 10,
    },
    dotPickerOption: {
        marginTop: 10,
    },
    dotPickerText: {
        marginLeft: 10,
        color: colors.text,
        fontSize: fontSizes.h3,
    },
    datePickerContainer: {
        marginLeft: 5,
    },
    regularText: {
        fontSize: fontSizes.p,
        color: colors.text,
    },
    repeatOptions: {
        ...globalStyles.flexRow,
        marginTop: 10,
    },
    notesInputContainer: {
        marginTop: 10,
        backgroundColor: colors.l3,
        borderRadius: 8,
        padding: 8,
    },
    notesInput: {
        color: colors.text,
        fontSize: fontSizes.p,
        padding: 0,
    },
});*/

export default EventInput;
