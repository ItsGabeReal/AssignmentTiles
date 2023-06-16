import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoryID } from "../../../../types/EventTypes";
import { testCategories } from '../../../TestData';
import { ColorValue } from 'react-native';

export type CategoriesState = Category[];

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState: testCategories as CategoriesState,
    reducers: {
        addCategory(state, action: PayloadAction<{ category: Category }>) {
            state.push(action.payload.category);
        },
        removeCategory(state, action: PayloadAction<{ categoryID: CategoryID }>) {
            // This will remove ALL categories matching the provided id
            for (let i = 0; i < state.length; i++) {
                const category = state[i];

                if (category.id === action.payload.categoryID) {
                    state.splice(i, 1);
                    i--;
                }
            }
        },
        editCategory(state, action: PayloadAction<{ categoryID: CategoryID, newName?: string, newColor?: ColorValue }>) {
            const categoryIndex = state.findIndex(item => item.id === action.payload.categoryID);
            if (categoryIndex === -1) {
                console.error(`categoriesSlice -> edit: Could not find category index`);
                return;
            }

            const editedCategory = {
                name: action.payload.newName || state[categoryIndex].name,
                color: action.payload.newColor || state[categoryIndex].color,
                id: state[categoryIndex].id,
            }

            state[categoryIndex] = editedCategory;
        }
    }
});

export function getCategoryFromID(categories: CategoriesState, categoryID: string) {
    return categories.find(item => item.id == categoryID);
}

export const { addCategory, removeCategory, editCategory } = categoriesSlice.actions;

export default categoriesSlice.reducer;