import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoriesState, Category, CategoryID } from "../../../../types/currentVersion";
import { ColorValue } from 'react-native';

const initialState: CategoriesState = {
    current: [],
    backup: null,
}

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        add(state, action: PayloadAction<{ category: Category }>) {
            state.current.push(action.payload.category);
        },
        removeAndBackup(state, action: PayloadAction<{ categoryID: CategoryID }>) {
            state.backup = deepCopyCategories(state.current);

            // This will remove ALL categories matching the provided id
            for (let i = 0; i < state.current.length; i++) {
                const category = state.current[i];

                if (category.id === action.payload.categoryID) {
                    state.current.splice(i, 1);
                    i--;
                }
            }
        },
        edit(state, action: PayloadAction<{ categoryID: CategoryID, newName?: string, newColor?: ColorValue }>) {
            const categoryIndex = state.current.findIndex(item => item.id === action.payload.categoryID);
            if (categoryIndex === -1) {
                console.error(`categoriesSlice -> edit: Could not find category index`);
                return;
            }

            const editedCategory = {
                name: action.payload.newName || state.current[categoryIndex].name,
                color: action.payload.newColor || state.current[categoryIndex].color,
                id: state.current[categoryIndex].id,
            }

            state.current[categoryIndex] = editedCategory;
        },
        restoreBackup(state) {
            if (!state.backup) {
                console.warn('categoriesSlice -> restoreBackup: No backup to restore. Be sure to call "backup" first.');
                return;
            }

            state.current = deepCopyCategories(state.backup);
        },
    }
});

function deepCopyCategories(categories: Category[]) {
    const output: Category[] = [];

    categories.forEach(item => {
        output.push({ ...item });
    });

    return output;
}

export const categoriesActions = categoriesSlice.actions;

export default categoriesSlice.reducer;