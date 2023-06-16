import { configureStore } from "@reduxjs/toolkit";
import categoriesSlice from "./features/categories/categoriesSlice";
import eventsReducer from './features/events/eventsSlice';
import rowPlansSlice from "./features/rowPlans/rowPlansSlice";
import visibleDaysSlice from "./features/visibleDays/visibleDaysSlice";

const store = configureStore({
    reducer: {
        categories: categoriesSlice,
        events: eventsReducer,
        rowPlans: rowPlansSlice,
        visibleDays: visibleDaysSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;

export default store;