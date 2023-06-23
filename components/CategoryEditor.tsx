import React, {
    forwardRef,
    useRef,
    useImperativeHandle,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Button,
    FlatList,
    Alert,
    TouchableOpacity,
} from 'react-native';
import FloatingModal, { FloatingModalRef } from './core/FloatingModal';
import { Category } from '../types/EventTypes';
import Icon from 'react-native-vector-icons/Ionicons';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import { useAppSelector, useAppDispatch } from '../src/redux/hooks';
import { eventActions } from '../src/redux/features/events/eventsSlice';
import { categoriesActions } from '../src/redux/features/categories/categoriesSlice';
import { textStyles } from '../src/GlobalStyles';
import StdText from './StdText';

export type CategoryEditorRef = {
    open: (() => void);
}

type CategoryEditorProps = {

}

const CategoryEditor = forwardRef<CategoryEditorRef, CategoryEditorProps>((props, ref) => {
    const categories = useAppSelector(state => state.categories);

    const floatingModalRef = useRef<FloatingModalRef | null>(null);

    useImperativeHandle(ref, () => ({
        open() {
            floatingModalRef.current?.open();
        }
    }));

    return (
        <FloatingModal ref={floatingModalRef} style={styles.mainContainer}>
            <View style={styles.titleContainer}>
                <StdText>Edit Categories:</StdText>
            </View>
            <FlatList
                data={categories}
                renderItem={({ item }) => <CategoryListItem category={item} />}
                ListEmptyComponent={() => {
                    return (
                        <View style={{ alignItems: 'center' }}>
                            <StdText>There are no categories.</StdText>
                            <Button title='Create Category' />
                        </View>
                    )
                }}
                ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#8888' }} />}
            />
        </FloatingModal>
    )
});

type CategoryListItemProps = {
    category: Category;
}
const CategoryListItem: React.FC<CategoryListItemProps> = (props) => {
    const dispatch = useAppDispatch();

    const categoryInputRef = useRef<CategoryInputRef | null>(null);

    function showDeletionConfirmation() {
        Alert.alert('Confirm', 'Are you sure you want to delete this category?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: () => deleteCategory(),
                style: 'destructive',
                isPreferred: true,
            },
        ], { cancelable: true, userInterfaceStyle: 'dark' })
    }

    function deleteCategory() {
        dispatch(eventActions.removeCategory({categoryID: props.category.id }));
        dispatch(categoriesActions.remove({categoryID: props.category.id}))
    }

    return (
        <>
            <CategoryInput ref={categoryInputRef} mode='edit' editedCategory={props.category} />
            <TouchableOpacity onPress={() => categoryInputRef.current?.open()} style={styles.categoryListItemContainer}>
                <StdText>{props.category.name}</StdText>
                <TouchableOpacity onPress={showDeletionConfirmation} hitSlop={15}>
                    <Icon name='trash' color='red' size={20} />
                </TouchableOpacity>
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        overflow: 'hidden',
        width: 250,
        height: 300,
        backgroundColor: '#222',
        borderRadius: 15,
        borderColor: '#888',
        borderWidth: StyleSheet.hairlineWidth,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 20,
    },
    categoryListItemContainer: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
});

export default CategoryEditor;