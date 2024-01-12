import React, {
    useRef,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Alert,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryInput, { CategoryInputRef } from './CategoryInput';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { activeOpacity, colors, fontSizes } from '../src/GlobalStyles';
import { deleteCategoryAndBackup } from '../src/CategoriesHelpers';

type CategoryListItemProps = {
    /**
     * The category id this component represents. 
     */
    categoryID: string | null;

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

    const category = useAppSelector(state => state.categories.current[props.categoryID || '']) || {
        name: 'None',
        color: colors.dimText
    };

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
            <CategoryInput ref={categoryInputRef} mode='edit' editedCategory={category} editedCategoryID={props.categoryID} />
            <TouchableOpacity activeOpacity={activeOpacity} onPress={() => props.onSelect?.(props.categoryID)} style={styles.categoryListItemContainer}>
                <Text style={[styles.categoryText, {color: category.color}]}>{category.name}</Text>
                {!hideCategoryActions ?
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity activeOpacity={activeOpacity} onPress={() => categoryInputRef.current?.open()} hitSlop={5}>
                            <Icon name='edit' color='#DD0' size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={activeOpacity} style={styles.deleteButton} onPress={deleteCategory} hitSlop={5}>
                            <Icon name='delete' color='#F00000' size={20} />
                        </TouchableOpacity>
                    </View>
                    : null
                }
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    categoryListItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
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

export default CategoryListItem;