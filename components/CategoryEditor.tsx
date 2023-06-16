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
import { removeCategory } from '../src/redux/features/categories/categoriesSlice';
import { removeCategoryFromEvents } from '../src/redux/features/events/eventsSlice';

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
                <Text style={styles.title}>Edit Categories:</Text>
            </View>
            <FlatList
                data={categories}
                renderItem={({ item }) => <CategoryListItem category={item} />}
                ListEmptyComponent={() => {
                    return (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#8888', marginBottom: 5 }}>There are no categories.</Text>
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
        dispatch(removeCategoryFromEvents({categoryID: props.category.id }));
        dispatch(removeCategory({categoryID: props.category.id}));
    }

    return (
        <>
            <CategoryInput ref={categoryInputRef} mode='edit' editedCategory={props.category} />
            <TouchableOpacity onPress={() => categoryInputRef.current?.open()} style={styles.categoryListItemContainer}>
                <Text style={{ color: props.category.color, fontSize: 16, marginRight: 'auto' }}>{props.category.name}</Text>
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
        color: 'white',
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