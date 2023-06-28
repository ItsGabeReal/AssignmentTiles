import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Pressable,
    TextInput,
} from 'react-native';
import IosStyleButton from './core/IosStyleButton';
import { Category } from '../types/EventTypes';
import FloatingModal, { FloatingModalRef } from './core/FloatingModal';
import { useAppDispatch } from '../src/redux/hooks';
import { categoriesActions } from '../src/redux/features/categories/categoriesSlice';
import TextInputWithClearButton from './core/TextInputWithClearButton';
import { categoryColorPalette, colors, fontSizes, globalStyles } from '../src/GlobalStyles';

export type CategoryInputRef = {
    /**
     * Opens the category input modal.
     */
    open: (() => void);
}

type CategoryInputProps = {
    /**
     * Specifies the category input mode. If it's set to 'create',
     * the submit button will create a new event. If it's set to
     * 'edit', the category provided through editedCategory will be
     * edited.
     */
    mode: 'create' | 'edit';

    /**
     * If mode is set to 'edit', the input fields will be autofilled
     * from this category, and once submitted, this category ID will
     * be edited.
     */
    editedCategory?: Category;

    /**
     * Called when a new category is created.
     */
    onCategoryCreated?: ((category: Category) => void);
}

const CategoryInput = forwardRef<CategoryInputRef, CategoryInputProps>((props, ref) => {
    const dispatch = useAppDispatch();
    
    const [nameInput, setNameInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(categoryColorPalette[0]);

    const floatingModalRef = useRef<FloatingModalRef | null>(null);
    const categoryNameInputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
        open() {
            floatingModalRef.current?.open();
            
            if (props.mode === 'edit') {
                if (!props.editedCategory) {
                    console.error(`CategoryInput/open: No edited category provided in edit mode`);
                    return;
                }
                setNameInput(props.editedCategory.name);
                setSelectedColor(props.editedCategory.color);
            }
            else {
                setNameInput('');
            }
        },
    }));

    function readyToSubmit() {
        return nameInput.length > 0;
    }

    function handleSubmit() {
        floatingModalRef.current?.close();

        if (props.mode === 'create') {
            const newCategory = {
                name: nameInput,
                color: selectedColor,
                id: Math.random().toString(),
            }
            dispatch(categoriesActions.add({category: newCategory}));
            
            props.onCategoryCreated?.(newCategory);
        }
        else {
            if (!props.editedCategory) {
                console.error(`CategoryInput/handleSubmit: Could not update category because edited category was not provided`);
                return;
            }
            dispatch(categoriesActions.edit({ categoryID: props.editedCategory.id, newName: nameInput, newColor: selectedColor }));
        }
    }
    
    return (
        <FloatingModal ref={floatingModalRef} style={styles.popup}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{props.mode === 'edit' ? 'Edit Category' : 'Create Category'}</Text>
            </View>
            <Pressable
                style={[globalStyles.parameterContainer, globalStyles.flexRow]}
                onPress={() => {
                    categoryNameInputRef.current?.focus();
                }}
            >
                <Text style={globalStyles.fieldDescription}>Name:</Text>
                <TextInputWithClearButton
                    ref={categoryNameInputRef}
                    value={nameInput}
                    textInputStyle={styles.inputText}
                    containerStyle={{borderRadius: 1, flex: 1}}
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
                                    style={[styles.colorButton, {
                                        backgroundColor: item,
                                        borderWidth: item == selectedColor ? 3 : 0,
                                    }]}
                                    onPress={() => setSelectedColor(item)}
                                />
                            );
                        }}
                        numColumns={4}
                        keyboardShouldPersistTaps='handled'
                    />
                </View>
            </View>
            <View style={styles.submitButtonContainer}>
                <IosStyleButton title={props.mode === 'edit' ? 'Save' : 'Done'} textStyle={styles.submitButton} disabled={!readyToSubmit()} onPress={handleSubmit} />
            </View>
        </FloatingModal>
    );
});

const styles = StyleSheet.create({
    popup: {
        width: 300,
        padding: 15,
        borderRadius: 10,
        backgroundColor: colors.l1,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 15
    },
    title: {
        fontSize: fontSizes.title,
        fontWeight: 'bold',
        color: colors.text,
    },
    inputText: {
        padding: 0,
        fontSize: fontSizes.p,
        color: colors.text,
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