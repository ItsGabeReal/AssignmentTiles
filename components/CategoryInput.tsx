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
import PressOutView, { PressOutViewRef } from './core/PressOutView';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { categoriesActions } from '../src/redux/features/categories/categoriesSlice';
import TextInputWithClearButton from './core/TextInputWithClearButton';
import { categoryColorPalette, colorTheme, fontSizes } from '../src/GlobalStyles';
import { focusTextInput } from '../src/GlobalHelpers';
import BlurView from './core/BlurView';
import InputField from './InputField';
import { RGBAToColorValue, gray, green, mixColor } from '../src/ColorHelpers';
import Button from './Button';
import { EventRegister } from 'react-native-event-listeners';

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
}

const CategoryInput = forwardRef<CategoryInputRef, CategoryInputProps>((props, ref) => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(state => state.categories.current);

    // Input states
    const [nameInput, setNameInput] = useState('');
    const [colorInput, setColorInput] = useState(categoryColorPalette[0]);

    // Component refs
    const pressOutViewRef = useRef<PressOutViewRef | null>(null);
    const nameInputRef = useRef<TextInput>(null);
    
    // Non-state variables
    const editedCategoryID = useRef<string | null>(null);
    const mode = useRef<'create' | 'edit'>('create');

    useImperativeHandle(ref, () => ({
        open(params) {
            pressOutViewRef.current?.open();
            mode.current = params.mode;
            
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
        let output = mixColor(colorInput, gray);

        output.a = 225;
        
        return RGBAToColorValue(output);
    }

    function readyToSubmit() {
        return nameInput.trim().length > 0;
    }

    function close() {
        pressOutViewRef.current?.close();
    }

    function submit() {
        if (mode.current === 'create') {
            // Come up with a new id
            const id = Math.random().toString();

            // Create category
            const newCategory = {
                name: nameInput.trim(),
                color: colorInput
            }
            
            // Add category
            dispatch(categoriesActions.add({category: newCategory, id}));
            
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
                if (mode.current === 'edit')
                    submit();

                close();
            }}
            style={{alignItems: 'center'}}
        >
            <BlurView
                borderRadius={20}
                blurType={colorTheme}
                style={[styles.mainContainer, {backgroundColor: getBackgroundColor()}]}
                onStartShouldSetResponder={() => true} // Absorb touch events. This prevents event input from closing when box is tapped
            >
                <InputField title='Name' style={{marginBottom: 20}} onPress={() => focusTextInput(nameInputRef)}>
                    <TextInputWithClearButton
                        ref={nameInputRef}
                        value={nameInput}
                        //autoFocus={true} <- This doesn't work right on android. The workaround is in useEffect.
                        onChangeText={setNameInput}
                        selectTextOnFocus={mode.current !== 'edit'} // Don't autoselect text in edit mode
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
                                        style={[styles.colorButton, {
                                            backgroundColor: RGBAToColorValue(item),
                                            borderWidth: item === colorInput ? 3 : 0
                                        }]}
                                        onPress={() => setColorInput(item)}
                                    />
                                );
                            }}
                            numColumns={4}
                            keyboardShouldPersistTaps='handled'
                            style={{flexGrow: 0}}
                        />
                    </View>
                </InputField>
            </BlurView>
            {mode.current === 'create' ?
                <Button
                    title='Create'
                    titleSize={20}
                    iconName='add'
                    iconSize={26}
                    backgroundColor={green}
                    style={{marginTop: 10, width: 175}}
                    disabled={!readyToSubmit()}
                    onPress={() => { submit(); close(); }}
                />
            :
                null
            }
            {/*<View style={styles.titleContainer}>
                    <Text style={styles.title}>{mode.current === 'edit' ? 'Edit Category' : 'Create Category'}</Text>
                </View>
                <Pressable
                    style={[globalStyles.parameterContainer, globalStyles.flexRow]}
                    onPress={() => focusTextInput(categoryNameInputRef)}
                >
                    <Text style={globalStyles.fieldDescription}>Name:</Text>
                    <TextInputWithClearButton
                        ref={categoryNameInputRef}
                        value={nameInput}
                        style={styles.textInput}
                        selectTextOnFocus
                        autoFocus
                        onChangeText={newText => setNameInput(newText)}
                    />
                </Pressable>
                <View style={globalStyles.parameterContainer}>
                    <Text style={globalStyles.fieldDescription}>Color:</Text>
                    <View style={styles.colorPaletteContainer}>
                        <FlatList
                            data={categoryColorPalette}
                            renderItem={({ item }) => {
                                return (
                                    <TouchableOpacity
                                        activeOpacity={activeOpacity}
                                        style={[styles.colorButton, {
                                            backgroundColor: item,
                                            borderWidth: item == colorInput ? 3 : 0,
                                        }]}
                                        onPress={() => setColorInput(item)}
                                    />
                                );
                            }}
                            numColumns={4}
                            keyboardShouldPersistTaps='handled'
                        />
                    </View>
                </View>
                <View style={styles.submitButtonContainer}>
                    <IosStyleButton title={mode.current === 'edit' ? 'Save' : 'Done'} textStyle={styles.submitButton} disabled={!readyToSubmit()} onPress={handleSubmit} />
                        </View>*/}
        </PressOutView>
    );
});

const styles = StyleSheet.create({
    mainContainer: {
        padding: 30
    },
    nameTextInput: {
        flex: 1,
        fontSize: fontSizes.h1,
        padding: 0,
        color: 'white'
    },
    colorPaletteContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    colorButton: {
        width: 46,
        height: 46,
        borderRadius: 100,
        borderColor: 'white',
        margin: 5,
    },
    submitButtonContainer: {
        alignItems: 'center',
    },
    submitButton: {
        fontSize: fontSizes.h1,
        fontWeight: 'bold',
    }
});

export default CategoryInput;