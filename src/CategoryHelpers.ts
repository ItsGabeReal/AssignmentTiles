import { Category } from "../types/EventTypes";

export type CategoryReducerAction =
    | { type: 'create', newCategory: Category }
    | { type: 'remove', categoryID: string };

export function categoriesReducer(state: Category[], action: CategoryReducerAction) {
    if (action.type == 'create') {
        const { newCategory } = action;

        const outputCategories = deepCopyCategories(state);

        outputCategories.push(newCategory);

        return outputCategories;
    }
    else if (action.type == 'remove') {
        const { categoryID } = action;

        const categoryIndex = state.findIndex(item => item.id == categoryID);
        if (categoryIndex === -1) {
            console.error(`categoriesReducer/remove: Could not find category index from id`);
            return state;
        }

        const outputCategories = deepCopyCategories(state);
        
        outputCategories.splice(categoryIndex, 1);

        return outputCategories;
    }
    else return state;
}

function deepCopyCategories(categories: Category[]) {
    const outputCategories: Category[] = [];
    for (let i = 0; i < categories.length; i++) {
        outputCategories[i] = {...categories[i]};
    }
    return outputCategories;
}

export function getCategoryFromID(categories: Category[], categoryID: string) {
    return categories.find(item => item.id == categoryID);
}