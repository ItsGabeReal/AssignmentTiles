import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    ColorValue,
} from 'react-native';
import { generalStyles, textStyles } from '../src/GlobalStyles';
import IosStyleButton from './core/IosStyleButton';
import { Category } from '../types/EventTypes';
import FloatingModal, { FloatingModalRef } from './core/FloatingModal';
import { useAppDispatch } from '../src/redux/hooks';
import { categoriesActions } from '../src/redux/features/categories/categoriesSlice';
import StdText from './StdText';
import TextInputWithClearButton from './core/TextInputWithClearButton';

const AVAILABLE_CATEGORY_COLORS: ColorValue[] = [
    '#f44',
    '#f84',
    '#ff4',
    '#4f4',
    '#4ff',
    '#48f',
    '#a4f',
];

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
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_CATEGORY_COLORS[0]);

    const floatingModalRef = useRef<FloatingModalRef | null>(null);

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
                <StdText type='title'>{props.mode === 'edit' ? 'Edit Category' : 'Create Category'}</StdText>
            </View>
            <StdText style={generalStyles.fieldDescription}>Name:</StdText>
            <TextInputWithClearButton
                value={nameInput}
                textInputStyle={[textStyles.p, { padding: 0 }]}
                containerStyle={generalStyles.parameterContainer}
                selectTextOnFocus
                autoFocus
                onChangeText={newText => setNameInput(newText)}
            />
            <StdText style={generalStyles.fieldDescription}>Color:</StdText>
            <View style={[generalStyles.parameterContainer, {alignItems: 'center'}]}>
                <FlatList
                    data={AVAILABLE_CATEGORY_COLORS}
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
                    numColumns={5}
                    keyboardShouldPersistTaps='handled'
                />
            </View>
            <View style={styles.submitButtonContainer}>
                <IosStyleButton title={props.mode === 'edit' ? 'Save' : 'Create'} textStyle={{fontWeight: 'bold', fontSize: 20}} disabled={!readyToSubmit()} onPress={handleSubmit} />
            </View>
        </FloatingModal>
    );
});

const styles = StyleSheet.create({
    popup: {
        width: 300,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#222',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#888'
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 15
    },
    title: {
        fontWeight: 'bold',
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 100,
        borderColor: 'white',
        margin: 3,
    },
    submitButtonContainer: {
        marginTop: 10,
        alignItems: 'center',
    }
});

export default CategoryInput;