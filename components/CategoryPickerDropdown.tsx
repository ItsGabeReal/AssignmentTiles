import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { fontSizes } from '../src/GlobalStyles';
import { deleteCategoryAndBackup, restoreCategoryFromBackup } from '../src/helpers/CategoriesHelpers';
import { RGBAToColorValue, gray, green, mixColor, white } from '../src/helpers/ColorHelpers';
import { Category } from '../types/store-current';
import Button from './Button';
import { EventRegister } from 'react-native-event-listeners';

// Constants
const CATEGORY_VERTICAL_SPACING = 8;

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
}

const CategoryPickerDropdown: React.FC<CategoryPickerDropdownProps> = (props) => {
    const categories = useAppSelector(state => state.categories.current);

    function createCategoryListItems() {
        const categoryListItems: React.ReactNode[] = [];

        // Sort categories by recently created
        const sortedCategories = Object.keys(categories).sort((a, b) => categories[b].createdAt - categories[a].createdAt);
        
        // Create category list items
        for (let i = 0; i < sortedCategories.length; i++) {
            categoryListItems.push(
                <CategoryListItem
                    key={sortedCategories[i]}
                    categoryID={sortedCategories[i]}
                    onSelect={props.onCategorySelected}
                    onEditPressed={() => props.onEditCategory(sortedCategories[i])}
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
                <View style={styles.spacer}/>
                <CategoryListItem
                    key={''}
                    categoryID={null}
                    hideCategoryActions
                    onSelect={props.onCategorySelected}
                />
                {createCategoryListItems()}
                <View style={styles.spacer}/>
            </ScrollView>
            <Button
                title='New Category'
                iconName='add'
                backgroundColor={green}
                onPress={props.onCreateCategory}
                style={styles.createButton}
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

    function getCategoryTextColor() {
        return RGBAToColorValue(mixColor(category.color, white, 0.1));
    }

    return (
        <>
            <TouchableOpacity onPress={() => props.onSelect(props.categoryID)} style={styles.categoryListItemContainer}>
                <Text style={[styles.categoryText, {color: getCategoryTextColor()}]}>{category.name}</Text>
                {!hideCategoryActions ?
                    <TouchableOpacity onPress={props.onEditPressed} hitSlop={5}>
                        <Icon name='edit' color='#AA2' size={20} />
                    </TouchableOpacity>
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
    spacer: {
        height: CATEGORY_VERTICAL_SPACING
    },
    categoryListItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: CATEGORY_VERTICAL_SPACING
    },
    categoryText: {
        fontSize: fontSizes.h3,
        marginRight: 8,
        flex: 1
    },
    createButton: {
        padding: 8,
        borderRadius: 0
    }
});

export default CategoryPickerDropdown;