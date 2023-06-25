import { combineReducers, configureStore } from "@reduxjs/toolkit";
import categoriesSlice from "./features/categories/categoriesSlice";
import eventsReducer from './features/events/eventsSlice';
import rowPlansSlice from "./features/rowPlans/rowPlansSlice";
import visibleDaysSlice from "./features/visibleDays/visibleDaysSlice";
import memorizedInputSlice from "./features/memorizedInput/memorizedInputSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
    categories: categoriesSlice,
    events: eventsReducer,
    rowPlans: rowPlansSlice,
    visibleDays: visibleDaysSlice,
    memorizedInput: memorizedInputSlice,
});

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: [
        'categories',
        'events',
        'rowPlans',
    ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk],
});

export const persistedStore = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;