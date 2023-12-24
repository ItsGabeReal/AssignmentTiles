import { categoriesActions } from './redux/features/categories/categoriesSlice';
import { eventActions } from './redux/features/events/eventsSlice';
import { AppDispatch } from './redux/store';

export function deleteCategoryAndBackup(dispatch: AppDispatch, categoryID: string) {
    dispatch(eventActions.removeCategoryAndBackup({ categoryID }));
    dispatch(categoriesActions.removeAndBackup({ categoryID }));
}

/**
 * Note: This only works properly if the last events backup was due
 * to a category deletion. For example, if an event is deleted after
 * a category is deleted, calling this function will cause unintended
 * results.
 */
export function restoreCategoryFromBackup(dispatch: AppDispatch) {
    dispatch(eventActions.restoreBackup());
    dispatch(categoriesActions.restoreBackup());
}