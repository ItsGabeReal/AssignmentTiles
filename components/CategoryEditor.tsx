import React, {
    forwardRef,
    useRef,
    useImperativeHandle,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Alert,
    TouchableOpacity,
} from 'react-native';
import FloatingModal, { FloatingModalRef } from './core/FloatingModal';
import { Category } from '../types/EventTypes';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import { useAppSelector, useAppDispatch } from '../src/redux/hooks';
import { eventActions } from '../src/redux/features/events/eventsSlice';
import { categoriesActions } from '../src/redux/features/categories/categoriesSlice';
import { colors, fontSizes } from '../src/GlobalStyles';

export type CategoryEditorRef = {
    /**
     * Open category editor modal.
     */
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
                        <View style={styles.emptyListMessageContainer}>
                            <Text style={styles.emptyListMessage}></Text>
                        </View>
                    )
                }}
                ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#8888' }} />}
            />
        </FloatingModal>
    )
});

type CategoryListItemProps = {
    /**
     * The category this list item represents.
     */
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
                <Text style={[styles.categoryText, {color: props.category.color}]}>{props.category.name}</Text>
                <TouchableOpacity style={{marginLeft: 'auto'}} onPress={showDeletionConfirmation} hitSlop={15}>
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
        backgroundColor: colors.l1,
        borderRadius: 15,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginVertical: 15,
        fontSize: fontSizes.title,
        color: colors.text,
    },
    emptyListMessageContainer: {
        alignItems: 'center'
    },
    emptyListMessage: {
        marginTop: 10,
        color: colors.dimText,
        fontSize: fontSizes.p,
    },
    categoryListItemContainer: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    categoryText: {
        fontSize: fontSizes.p,
    },
});

export default CategoryEditor;