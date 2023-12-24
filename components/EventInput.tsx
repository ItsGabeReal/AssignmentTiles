import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    ScrollView,
    Switch,
    Pressable,
    ColorValue,
} from 'react-native';
import CompactDatePicker from './core/CompactDatePicker';
import IosStyleButton from './core/IosStyleButton';
import DateYMD, { DateYMDHelpers } from '../src/DateYMD';
import { EventDetails } from '../types/store-current';
import CategoryPicker, { CategoryPickerRef } from './CategoryPicker';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import NumberInput from './core/NumberInput';
import HideableView from './core/HideableView';
import TextInputWithClearButton from './core/TextInputWithClearButton';
import { colors, fontSizes, globalStyles } from '../src/GlobalStyles';
import DotPicker from './core/DotPicker';
import { focusTextInput } from '../src/GlobalHelpers';
import { generalStateActions } from '../src/redux/features/general/generalSlice';

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
    initialCategoryID?: string | null;

    /**
     * The notes to be autofilled when the component is created.
     */
    initialNotes?: string;

    /**
     * Changes the visuals and behavior of text input.
    */
    mode: 'create' | 'edit';
    
    /**
        * Called when the event is submitted (created or edited).
    */
    onSubmit: ((eventDetails: EventDetails, repeatSettings: RepeatSettings | null) => void);

    /**
     * Called when the modal wants to close. Should set visible to false.
     */
    onRequestClose: (() => void);
}

const EventInput: React.FC<EventInputProps> = (props) => {
    const categories = useAppSelector(state => state.categories.current);
    const dispatch = useAppDispatch();

    const [eventNameInput, setEventNameInput] = useState(props.initialName || '');
    const [selectedDueTypeIndex, setSelectedDueTypeIndex] = useState(props.initialDueDate != null ? 1 : 0);
    const [dueTypeInput, setDueTypeInput] = useState(props.initialDueDate != null ? 'before-date' : 'none');
    const [dueDateInput, setDueDateInput] = useState(DateYMDHelpers.toDate(props.initialDueDate || DateYMDHelpers.today()));
    const [repeatSwitchValue, setRepeatSwitchValue] = useState(false);
    const [repeatRecurrences, setRepeatRecurrences] = useState(2);
    const [repeatValueInput, setRepeatValueInput] = useState(7);
    const [repeatValueTypeInput, setRepeatValueTypeInput] = useState<RepeatValueType>('days');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(props.initialCategoryID || null);
    
    const scrollViewRef = useRef<ScrollView | null>(null);
    const eventNameInputRef = useRef<TextInput>(null);
    const categoryPickerRef = useRef<CategoryPickerRef | null>(null);
    const notesInput = useRef(props.initialNotes || '');
    
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

    function getCategoryColor(): ColorValue {
        if (!selectedCategory) return colors.dimText;

        return categories[selectedCategory].color;
    }

    function getCategoryName() {
        if (!selectedCategory) return 'None';

        return categories[selectedCategory].name;
    }

    function onDateChanged(newDate?: Date) {
        if (newDate) {
            setDueDateInput(newDate);
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
                categoryID: selectedCategory,
                notes: notesInput.current,
            };

            const repeatSettings: RepeatSettings = {
                valueType: repeatValueTypeInput,
                value: repeatValueInput,
                recurrences: repeatRecurrences,
            }

            props.onSubmit(details, repeatSwitchValue ? repeatSettings : null);

            dispatch(generalStateActions.updateMemorizedEventInput({name: details.name, categoryID: details.categoryID}));
        }
    }

    function handleCategoryDeleted(deletedCategoryID: string) {
        if (deletedCategoryID === selectedCategory) {
            setSelectedCategory(null);
        }

        /**
         * Set remembered category id to null so there's no issue
         * autofilling a category that doesn't exist anymore.
         */
        dispatch(generalStateActions.updateMemorizedEventInput({categoryID: null}));
    }

    return (
        <>
            <CategoryPicker ref={categoryPickerRef} onSelect={categoryID => setSelectedCategory(categoryID)} onDelete={handleCategoryDeleted} />
            <View style={styles.mainContainer}>
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
                            selectTextOnFocus={props.mode !== 'edit'} // Don't autoselect text in edit mode
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
                                placeholder='Add notes here...'
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
    );
}

const styles = StyleSheet.create({
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
});

export default EventInput;
