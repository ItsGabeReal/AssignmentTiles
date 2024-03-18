import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PressOutView, { PressOutViewRef } from './core/views/PressOutView';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { categoriesActions } from '../src/redux/features/categories/categoriesSlice';
import TextInputWithClearButton from './core/input/TextInputWithClearButton';
import { categoryColorPalette, colorTheme, fontSizes, globalStyles } from '../src/GlobalStyles';
import { focusTextInput } from '../src/helpers/GlobalHelpers';
import BlurView from './core/wrappers/BlurView';
import InputField from './InputField';
import { RGBAToColorValue, colorsEqual, gray, green, mixColor, red } from '../src/helpers/ColorHelpers';
import Button from './Button';
import { EventRegister } from 'react-native-event-listeners';
import { generateUID } from '../src/General';

export type CategoryInputRef = {
    /**
     * Opens the category input modal.
     */
    open: ((params: { mode: 'edit', categoryID: string} | { mode: 'create' }) => void);
}

type CategoryInputProps = {
    /**
     * Called when a category is either created or edited.
     * 
     * Note: When mode='create', there is no need to add the category to state.
     * That's already handled.
     */
    onSubmit: ((categoryID: string, mode: 'create' | 'edit') => void);

    /**
     * Called when the user pressed the delete button when editing a category.
     */
    onDelete: ((categoryID: string) => void);
}

const CategoryInput = forwardRef<CategoryInputRef, CategoryInputProps>((props, ref) => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(state => state.categories.current);

    // States
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [nameInput, setNameInput] = useState('');
    const [colorInput, setColorInput] = useState(categoryColorPalette[0]);

    // Component refs
    const pressOutViewRef = useRef<PressOutViewRef | null>(null);
    const nameInputRef = useRef<TextInput>(null);
    
    // Non-state variables
    const editedCategoryID = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
        open(params) {
            pressOutViewRef.current?.open();
            setMode(params.mode);
            
            if (params.mode === 'edit') {
                const category = categories[params.categoryID];
                if (!category) {
                    console.warn(`CategoryInput -> open: Could not load category. Category not found.`);
                    return;
                }

                setNameInput(category.name);
                setColorInput(category.color);
                editedCategoryID.current = params.categoryID;
            }
            else {
                setNameInput('');
                setColorInput(categoryColorPalette[0]);
            }
        },
    }));
    
    function getBackgroundColor() {
        const output = mixColor(colorInput, {r:100,g:100,b:100,a:255}, 0.7);

        output.a = 225;
        
        return RGBAToColorValue(output);
    }

    function readyToSubmit() {
        return nameInput.trim().length > 0;
    }

    function onDeletePressed() {
        if (editedCategoryID.current === null) {
            console.log("CategoryInput -> onDeletePressed: Unable to delete category because editedCategoryID is null.");
            return;
        }

        props.onDelete(editedCategoryID.current);
        
        close();
    }

    function close() {
        pressOutViewRef.current?.close();
    }

    function submit() {
        if (mode === 'create') {
            const id = generateUID();
            
            // Add category
            dispatch(categoriesActions.add({name: nameInput.trim(), color: colorInput, id}));
            
            props.onSubmit?.(id, 'create');
        }
        else {
            if (!editedCategoryID.current) {
                console.error(`CategoryInput -> submit: Could not edit category. editedCategoryID.current is null.`);
                return;
            }

            dispatch(categoriesActions.edit({ categoryID: editedCategoryID.current, newName: nameInput.trim(), newColor: colorInput }));
        }

        // If an undo popup hasn't been manually closed yet, go ahead and close it
        EventRegister.emit('hideUndoPopup');
    }

    return (
        <PressOutView
            ref={pressOutViewRef}
            onClose={() => {
                if (mode === 'edit')
                    submit();

                close();
            }}
            style={styles.pressOutContainer}
        >
            <BlurView
                borderRadius={20}
                blurType={colorTheme}
                style={[styles.mainContainer, {backgroundColor: getBackgroundColor()}]}
                onStartShouldSetResponder={() => true} // Absorb touch events. This prevents event input from closing when box is tapped
            >
                <InputField title='Name' style={styles.inputField} onPress={() => focusTextInput(nameInputRef)}>
                    <TextInputWithClearButton
                        ref={nameInputRef}
                        value={nameInput}
                        autoFocus={true}
                        onChangeText={setNameInput}
                        style={styles.nameTextInput}
                        closeButtonColor='white'
                        textAlign='center'
                        maxLength={50}
                    />
                </InputField>
                <InputField title='Color'>
                    <View>
                        <FlatList
                            data={categoryColorPalette}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity
                                        style={[styles.colorButton, globalStyles.dropShadow, {
                                            backgroundColor: RGBAToColorValue(item),
                                            borderWidth: colorsEqual(item, colorInput) ? 3 : 0
                                        }]}
                                        onPress={() => setColorInput(item)}
                                    />
                                );
                            }}
                            numColumns={4}
                            keyboardShouldPersistTaps='handled'
                            style={styles.flatlist}
                            scrollEnabled={false}
                        />
                    </View>
                </InputField>
            </BlurView>
            {mode === 'create' ?
                <Button
                    title='Create'
                    titleSize={20}
                    iconName='add'
                    iconSize={26}
                    backgroundColor={green}
                    style={[styles.createButton, globalStyles.dropShadow]}
                    disabled={!readyToSubmit()}
                    onPress={() => { submit(); close(); }}
                />
            :
                <Button
                    title='Delete'
                    iconName='delete'
                    backgroundColor={red}
                    style={[styles.deleteButton, globalStyles.dropShadow]}
                    disabled={!readyToSubmit()}
                    onPress={onDeletePressed}
                />
            }
        </PressOutView>
    );
});

const styles = StyleSheet.create({
    pressOutContainer: {
        alignItems: 'center'
    },
    mainContainer: {
        padding: 30
    },
    inputField: {
        marginBottom: 20
    },
    nameTextInput: {
        flex: 1,
        fontSize: fontSizes.h1,
        padding: 0,
        color: 'white'
    },
    colorButton: {
        width: 46,
        height: 46,
        borderRadius: 100,
        borderColor: 'white',
        margin: 5,
    },
    flatlist: {
        flexGrow: 0
    },
    createButton: {
        marginTop: 10,
        width: 175
    },
    deleteButton: {
        marginTop: 10
    }
});

export default CategoryInput;