import { Category } from "../types/EventTypes";

export type CategoryReducerAction =
    | { type: 'create', newCategory: Category };

export function categoriesReducer(state: Category[], action: CategoryReducerAction) {
    if (action.type == 'create') {
        const { newCategory } = action;

        const outputCategories = deepCopyCategories(state);

        outputCategories.push(newCategory);

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