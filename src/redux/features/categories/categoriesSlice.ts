import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoriesState, Category } from "../../../../types/store-current";
import { ColorValue } from 'react-native';

const initialState: CategoriesState = {
    current: {},
    backup: null,
}

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        add(state, action: PayloadAction<{ category: Category, id: string }>) {
            state.current[action.payload.id] = action.payload.category;
        },
        removeAndBackup(state, action: PayloadAction<{ categoryID: string }>) {
            state.backup = deepCopyCategories(state.current);

            // Delete category
            delete state.current[action.payload.categoryID];
        },
        edit(state, action: PayloadAction<{ categoryID: string, newName?: string, newColor?: ColorValue }>) {
            const {
                categoryID,
                newName,
                newColor
            } = action.payload;
            
            const editedCategory = {
                name: newName || state.current[categoryID].name,
                color: newColor || state.current[categoryID].color
            }

            state.current[categoryID] = editedCategory;
        },
        restoreBackup(state) {
            if (!state.backup) {
                console.warn('categoriesSlice -> restoreBackup: No backup to restore.');
                return;
            }

            state.current = deepCopyCategories(state.backup);
        },
    }
});

function deepCopyCategories(categories: {[key: string]: Category}) {
    const output: {[key: string]: Category} = {};

    for (let key in categories) {
        output[key] = { ...categories[key] };
    }

    return output;
}

export const categoriesActions = categoriesSlice.actions;

export default categoriesSlice.reducer;