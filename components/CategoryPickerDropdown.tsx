import React, {
    useRef,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { activeOpacity, colors, fontSizes, globalStyles } from '../src/GlobalStyles';
import { deleteCategoryAndBackup, restoreCategoryFromBackup } from '../src/CategoriesHelpers';
import { RGBAToColorValue, gray, green, hexToRGBA, white } from '../src/ColorHelpers';
import { Category } from '../types/store-current';
import Button from './Button';
import { EventRegister } from 'react-native-event-listeners';

// Constants
const CATEGORY_VERTICAL_SPACING = 15;

type CategoryPickerDropdownProps = {
    /**
     * Called when the user selects a category.
     */
    onCategorySelected: ((categoryID: string | null) => void);

    /**
     * Called when the user presses the edit button next to
     * a category. Should be used to open a category input.
     * 
     * It must be this way because we cannot open a category
     * input form within the CategoryPickerDropdown (the category input
     * component is confined within the dropdown menu).
     */
    onEditCategory: ((catgoryID: string) => void);

    /**
     * Called when the user presses the create category button.
     * Should be used to open a category input.
     * 
     * It must be this way because we cannot open a category
     * input form within the CategoryPickerDropdown (the category input
     * component is confined within the dropdown menu).
     */
    onCreateCategory: (() => void);
    
    /**
     * Called when the user deletes a category. This should be
     * used to handle any edge cases releated to category deletion.
     */
    onCategoryDeleted?: ((categoryID: string) => void);
}

const CategoryPickerDropdown: React.FC<CategoryPickerDropdownProps> = (props) => {
    const categories = useAppSelector(state => state.categories.current);

    function createCategoryListItems() {
        const categoryListItems: React.ReactNode[] = [];

        for (let categoryID in categories) {
            categoryListItems.push(
                <CategoryListItem
                    key={categoryID}
                    categoryID={categoryID}
                    onSelect={props.onCategorySelected}
                    onDeleted={props.onCategoryDeleted}
                    onEditPressed={() => props.onEditCategory(categoryID)}
                />
            )
        }

        return categoryListItems;
    }

    return (
        <>
            <ScrollView
                style={styles.scrollView}
            >
                <View style={{height: CATEGORY_VERTICAL_SPACING}}/>
                <CategoryListItem
                    key={''}
                    categoryID={null}
                    hideCategoryActions
                    onSelect={props.onCategorySelected}
                />
                {createCategoryListItems()}
            </ScrollView>
            {/*<TouchableOpacity
                style={[globalStyles.flexRow, { backgroundColor: '#2F28', padding: 10 }]}
                onPress={props.onCreateCategory}
            >
                <Icon name='add' color={'white'}/>
                <Text style={{ color: 'white', fontSize: fontSizes.p, marginLeft: 5 }}>Create</Text>
            </TouchableOpacity>*/}
            <Button
                title='Create'
                iconName='add'
                backgroundColor={green}
                onPress={props.onCreateCategory}
            />
        </>
    );
}

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
    onSelect: ((categoryID: string | null) => void);

    /**
     * Called if this category is deleted.
     */
    onDeleted?: ((categoryID: string) => void);

    /**
     * Called if the user presses the edit button next to the category.
     */
    onEditPressed?: (() => void);
}

const CategoryListItem: React.FC<CategoryListItemProps> = (props) => {
    const {
        hideCategoryActions = false,
    } = props;

    const category: Category = useAppSelector(state => state.categories.current[props.categoryID || '']) || {
        name: 'None',
        color: gray
    };
    
    const dispatch = useAppDispatch();


    function deleteCategory() {
        if (!props.categoryID) {
            console.warn('CategoryPicker -> deleteCategory: Could not delete category because no category was provided to CategoryListItem');
            return;
        }

        deleteCategoryAndBackup(dispatch, props.categoryID);
        EventRegister.emit('showUndoPopup', { action: 'Category Deleted', onPressed: ()=>{restoreCategoryFromBackup(dispatch)} });

        props.onDeleted?.(props.categoryID);
    }

    return (
        <>
            <TouchableOpacity activeOpacity={activeOpacity} onPress={() => props.onSelect(props.categoryID)} style={styles.categoryListItemContainer} hitSlop={5}>
                <Text style={[styles.categoryText, {color: RGBAToColorValue(category.color)}]}>{category.name}</Text>
                {!hideCategoryActions ?
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity activeOpacity={activeOpacity} onPress={props.onEditPressed} hitSlop={5}>
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
    scrollView: {
        paddingHorizontal: 15
    },
    categoryListItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: CATEGORY_VERTICAL_SPACING
    },
    categoryText: {
        fontSize: fontSizes.h3,
    },
    actionButtonContainer: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    deleteButton: {
        marginLeft: 10,
    },
});

export default CategoryPickerDropdown;