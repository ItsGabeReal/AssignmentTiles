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
    TextInput,
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
    open: (() => void);
}

type CategoryInputProps = {
    mode?: 'create' | 'edit';
    editedCategory?: Category;
    onCategoryCreated?: ((category: Category) => void);
}

const CategoryInput = forwardRef<CategoryInputRef, CategoryInputProps>((props, ref) => {
    const dispatch = useAppDispatch();
    
    const [nameInput, setNameInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_CATEGORY_COLORS[0]);

    const floatingModalRef = useRef<FloatingModalRef | null>(null);

    const inputMode = props.mode || 'create';

    useImperativeHandle(ref, () => ({
        open() {
            floatingModalRef.current?.open();
            
            if (inputMode == 'edit') {
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

        if (inputMode == 'create') {
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
                <StdText>{inputMode == 'edit' ? 'Edit Category' : 'Create Category'}</StdText>
            </View>
            <StdText>Name:</StdText>
            <TextInput value={nameInput} style={generalStyles.parameterContainer} selectTextOnFocus autoFocus onChangeText={newText => setNameInput(newText)} />
            <StdText>Color:</StdText>
            <View style={generalStyles.parameterContainer}>
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
                />
            </View>
            <View style={styles.submitButtonContainer}>
                <IosStyleButton title={inputMode == 'edit' ? 'Save' : 'Create'} textStyle={{fontWeight: 'bold', fontSize: 20}} disabled={!readyToSubmit()} onPress={handleSubmit} />
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
    },
    submitButtonContainer: {
        marginTop: 10,
        alignItems: 'center',
    }
});

export default CategoryInput;