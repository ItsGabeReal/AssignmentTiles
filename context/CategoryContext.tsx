import React, { useReducer, useRef, useEffect } from 'react';
import { Category } from '../types/EventTypes';
import { CategoryReducerAction, categoriesReducer } from '../src/CategoryHelpers';

const testCategories: Category[] = [
    {
        name: 'Discrete Logic',
        color: '#48f',
        id: 'logic',
    },
    {
        name: 'Calculus 2',
        color: '#4f4',
        id: 'calc',
    },
    {
        name: 'Mechanics',
        color: '#ff4',
        id: 'mech',
    },
];

type CategoryContextType = {
    state: Category[],
    dispatch: React.Dispatch<CategoryReducerAction>;
    closureSafeRef: React.MutableRefObject<Category[]>;
}

const defaultContextState: CategoryContextType = {
    state: [],
    dispatch: () => console.error('empty event data dispatch'),
    closureSafeRef: { current: [] },
}

const CategoryContext = React.createContext<CategoryContextType>(defaultContextState);

type CategoryContextProviderProps = {
    children?: React.ReactNode;
}

export const CategoryContextProvider: React.FC<CategoryContextProviderProps> = (props) => {
    const [categories, categoriesDispatch] = useReducer(categoriesReducer, testCategories);

    const categories_closureSafeRef = useRef(categories);

    useEffect(() => {
        categories_closureSafeRef.current = categories;
    }, [categories]);

    return (
        <CategoryContext.Provider value={{ state: categories, dispatch: categoriesDispatch, closureSafeRef: categories_closureSafeRef }}>
            { props.children }
        </CategoryContext.Provider>
    )
}

export default CategoryContext;