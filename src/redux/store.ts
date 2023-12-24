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

/**
 * Indicates the data version the app is using. If this is higher
 * than a client's current version, the data will go through migration
 * functions until it reaches the latest version.
 */
export const latestStoreVersion = 2;

const rootReducer = combineReducers({
    categories: categoriesSlice,
    events: eventsReducer,
    general: generalSlice,
    rowPlans: rowPlansSlice,
    visibleDays: visibleDaysSlice,
});

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;