import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoriesState, Category } from "../../../../types/store-current";
import { RGBAColor } from '../../../helpers/ColorHelpers';
import { createTimestamp } from '../../../General';

const initialState: CategoriesState = {
    current: {},
    backup: null,
}

export const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        add(state, action: PayloadAction<{ name: string, color: RGBAColor, id: string }>) {
            state.current[action.payload.id] = {
                name: action.payload.name,
                color: action.payload.color,
                createdAt: createTimestamp()
            };
        },
        removeAndBackup(state, action: PayloadAction<{ categoryID: string }>) {
            state.backup = deepCopyCategories(state.current);

            // Delete category
            delete state.current[action.payload.categoryID];
        },
        edit(state, action: PayloadAction<{ categoryID: string, newName?: string, newColor?: RGBAColor }>) {
            const {
                categoryID,
                newName,
                newColor
            } = action.payload;
            
            const editedCategory = {
                ...state.current[categoryID],
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
