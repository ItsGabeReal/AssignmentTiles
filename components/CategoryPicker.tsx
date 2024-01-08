import React, {
    forwardRef,
    useRef,
    useImperativeHandle
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
import { Category } from '../types/store-current';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import { useAppSelector, useAppDispatch } from '../src/redux/hooks';
import { activeOpacity, colors, fontSizes } from '../src/GlobalStyles';
import IosStyleButton from './core/IosStyleButton';
import { deleteCategoryAndBackup, restoreCategoryFromBackup } from '../src/CategoriesHelpers';
import UndoPopup, { UndoPopupRef } from './UndoPopup';

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
    onSelect?: ((categoryID: string | null) => void);

    /**
     * Called whenever a category is deleted. Should be used to
     * check if the the currently selected category was deleted.
     */
    onDelete?: ((deletedCategoryID: string) => void);
}

const CategoryPicker = forwardRef<CategoryPickerRef, CategoryPickerProps>((props, ref) => {
    const dispatch = useAppDispatch();

    const categories = useAppSelector(state => state.categories.current);

    const categoryInputRef = useRef<CategoryInputRef | null>(null);
    const floatingModalRef = useRef<FloatingModalRef | null>(null);
    const undoPopupRef = useRef<UndoPopupRef | null>(null);

    useImperativeHandle(ref, () => ({
        open() {
            floatingModalRef.current?.open();
        }
    }));

    function handleOnSelect(categoryID: string | null) {
        floatingModalRef.current?.close();
        props.onSelect?.(categoryID);
    }

    function handleCategoryDeleted(categoryID: string) {
        props.onDelete?.(categoryID);

        undoPopupRef.current?.open(
            'Category Deleted',
            () => restoreCategoryFromBackup(dispatch)
        );
    }

    function createCategoryComponents() {
        const output: React.JSX.Element[] = [];

        for (let key in categories) {
            output.push(<CategoryListItem key={key} category={categories[key]} categoryID={key} onSelect={handleOnSelect} onDeleted={handleCategoryDeleted} />);
        }

        return output;
    }

    return (
        <>
            <FloatingModal
                ref={floatingModalRef}
                style={styles.mainContainer}
                outerChildren={<UndoPopup ref={undoPopupRef} />}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Select Category</Text>
                </View>
                <View style={styles.scrollViewContainer}>
                    <ScrollView
                        style={styles.scrollView}
                        keyboardShouldPersistTaps='always'
                    >
                        <CategoryListItem key='none' hideCategoryActions onSelect={handleOnSelect} />
                        {createCategoryComponents()}
                    </ScrollView>
                </View>
                <View style={styles.submitButtonContainer}>
                    <IosStyleButton textStyle={styles.submitButton} title='Create +' onPress={() => categoryInputRef.current?.open()} />
                </View>
                <CategoryInput ref={categoryInputRef} mode='create' onCategoryCreated={categoryID => handleOnSelect(categoryID)} />
            </FloatingModal>
        </>
    )
});

type CategoryListItemProps = {
    /**
     * Category details for display purposes.
     */
    category?: Category;

    /**
     * The category id this component represents.
     */
    categoryID?: string;

    /**
     * Hides the edit and delete buttons next to the category.
     */
    hideCategoryActions?: boolean;

    /**
     * Called when this category is selected.
     */
    onSelect?: ((categoryID: string | null) => void);

    /**
     * Called if this category is deleted.
     */
    onDeleted?: ((categoryID: string) => void);
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
        ], { cancelable: true});
    }

    function deleteCategory() {
        if (!props.categoryID) {
            console.warn('CategoryPicker -> deleteCategory: Could not delete category because no category was provided to CategoryListItem');
            return;
        }

        deleteCategoryAndBackup(dispatch, props.categoryID);

        props.onDeleted?.(props.categoryID);
    }

    return (
        <>
            <CategoryInput ref={categoryInputRef} mode='edit' editedCategory={props.category} editedCategoryID={props.categoryID} />
            <TouchableOpacity activeOpacity={activeOpacity} onPress={() => props.onSelect?.(props.categoryID || null)} style={styles.categoryListItemContainer}>
                <Text style={[styles.categoryText, {color: props.category?.color || colors.dimText}]}>{props.category?.name || 'None'}</Text>
                {!hideCategoryActions ?
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity activeOpacity={activeOpacity} onPress={() => categoryInputRef.current?.open()} hitSlop={5}>
                            <Icon name='edit' color='#dd0' size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={activeOpacity} style={styles.deleteButton} onPress={deleteCategory} hitSlop={5}>
                            <Icon name='delete' color='#f00000' size={20} />
                        </TouchableOpacity>
                    </View>
                    : null
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
        paddingTop: 10,
        paddingHorizontal: 15,
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
        backgroundColor: colors.l4,
        marginBottom: 10,
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