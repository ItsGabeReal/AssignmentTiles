import React, {
    forwardRef,
    useRef,
    useImperativeHandle,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Alert,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import FloatingModal, { FloatingModalRef } from './core/FloatingModal';
import { Category, CategoryID } from '../types/EventTypes';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import { useAppSelector, useAppDispatch } from '../src/redux/hooks';
import { eventActions } from '../src/redux/features/events/eventsSlice';
import { categoriesActions } from '../src/redux/features/categories/categoriesSlice';
import { colors, fontSizes } from '../src/GlobalStyles';
import IosStyleButton from './core/IosStyleButton';

export type CategoryPickerRef = {
    /**
     * Open category picker modal.
     */
    open: (() => void);
}

type CategoryPickerProps = {
    /**
     * Called when a category is selected.
     */
    onSelect?: ((categoryID: CategoryID) => void);

    /**
     * Called whenever a category is deleted. Should be used to
     * check if the the currently selected category was deleted.
     */
    onDelete?: ((deletedCategoryID: CategoryID) => void);
}

const CategoryPicker = forwardRef<CategoryPickerRef, CategoryPickerProps>((props, ref) => {
    const categories = useAppSelector(state => state.categories);

    const categoryInputRef = useRef<CategoryInputRef | null>(null);
    const floatingModalRef = useRef<FloatingModalRef | null>(null);

    useImperativeHandle(ref, () => ({
        open() {
            floatingModalRef.current?.open();
        }
    }));

    function handleOnSelect(categoryID: CategoryID) {
        floatingModalRef.current?.close();
        props.onSelect?.(categoryID);
    }

    return (
        <>
            <FloatingModal ref={floatingModalRef} style={styles.mainContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Select Category</Text>
                </View>
                <View style={styles.scrollViewContainer}>
                    <ScrollView style={styles.scrollView}>
                        <CategoryListItem key='none' hideCategoryActions onSelect={handleOnSelect} />
                        {categories.map(item =>
                            <CategoryListItem key={item.id} category={item} onSelect={handleOnSelect} onDeleted={props.onDelete} />
                        )}
                    </ScrollView>
                </View>
                <View style={styles.submitButtonContainer}>
                    <IosStyleButton textStyle={styles.submitButton} title='Create +' onPress={() => categoryInputRef.current?.open()} />
                </View>
                <CategoryInput ref={categoryInputRef} mode='create' onCategoryCreated={newCategory => handleOnSelect(newCategory.id)} />
            </FloatingModal>
        </>
    )
});

type CategoryListItemProps = {
    /**
     * The category this list item represents.
     */
    category?: Category;

    /**
     * Hides the edit and delete buttons next to the category.
     */
    hideCategoryActions?: boolean;

    /**
     * Called when this category is selected.
     */
    onSelect?: ((categoryID: CategoryID) => void);

    /**
     * Called if this category is deleted.
     */
    onDeleted?: ((categoryID: CategoryID) => void);
}

const CategoryListItem: React.FC<CategoryListItemProps> = (props) => {
    const {
        hideCategoryActions = false,
    } = props;

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
        ], { cancelable: true})
    }

    function deleteCategory() {
        if (!props.category) {
            console.warn('CategoryPicker -> deleteCategory: Could not delete category because no category was provided to CategoryListItem');
            return;
        }

        dispatch(eventActions.removeCategory({categoryID: props.category.id }));
        dispatch(categoriesActions.remove({categoryID: props.category.id}));
        props.onDeleted?.(props.category.id);
    }

    return (
        <>
            <CategoryInput ref={categoryInputRef} mode='edit' editedCategory={props.category} />
            <TouchableOpacity onPress={() => props.onSelect?.(props.category?.id || null)} style={styles.categoryListItemContainer}>
                <Text style={[styles.categoryText, {color: props.category?.color || colors.dimText}]}>{props.category?.name || 'None'}</Text>
                {!hideCategoryActions ?
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity onPress={() => categoryInputRef.current?.open()} hitSlop={5}>
                            <Icon name='edit' color='#f0f000' size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={showDeletionConfirmation} hitSlop={5}>
                            <Icon name='delete' color='#f00000' size={20} />
                        </TouchableOpacity>
                    </View>
                    : <></>
                }
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        overflow: 'hidden',
        width: 250,
        height: 350,
        backgroundColor: colors.l1,
        borderRadius: 15,
        padding: 10,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: fontSizes.title,
        color: colors.text,
        marginBottom: 10,
    },
    scrollViewContainer: {
        overflow: 'hidden',
        borderRadius: 10,
        flex: 1,
    },
    scrollView: {
        flex: 1,
        backgroundColor: colors.l2,
    },
    submitButtonContainer: {
        margin: 5,
        alignItems: 'center',
    },
    submitButton: {
        fontSize: fontSizes.h1,
        fontWeight: 'bold',
    },
    categoryListItemContainer: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        backgroundColor: colors.l3,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: fontSizes.p,
    },
    actionButtonContainer: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    deleteButton: {
        marginLeft: 10,
    },
});

export default CategoryPicker;