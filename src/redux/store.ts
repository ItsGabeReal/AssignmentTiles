import { combineReducers, configureStore } from "@reduxjs/toolkit";
import categoriesSlice from "./features/categories/categoriesSlice";
import eventsReducer from './features/events/eventsSlice';
import rowPlansSlice from "./features/rowPlans/rowPlansSlice";
import visibleDaysSlice from "./features/visibleDays/visibleDaysSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from 'redux-thunk';
import migrate from "./migration";
import generalSlice from "./features/general/generalSlice";

const rootReducer = combineReducers({
    categories: categoriesSlice,
    events: eventsReducer,
    general: generalSlice,
    rowPlans: rowPlansSlice,
    visibleDays: visibleDaysSlice,
});

export const latestStoreVersion = 0;

const persistConfig = {
    key: 'root',
    version: latestStoreVersion,
    storage: AsyncStorage,
    whitelist: [
        'categories',
        'events',
        'rowPlans',
    ],
    migrate: migrate,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk],
});

export const persistedStore = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;