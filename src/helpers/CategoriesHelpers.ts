import { categoriesActions } from '../redux/features/categories/categoriesSlice';
import { eventActions } from '../redux/features/events/eventsSlice';
import { AppDispatch } from '../redux/store';

export function deleteCategoryAndBackup(dispatch: AppDispatch, categoryID: string) {
    dispatch(eventActions.removeCategoryAndBackup({ categoryID }));
    dispatch(categoriesActions.removeAndBackup({ categoryID }));
}

/**
 * Note: Only call this function after deleteCategoryAndBackup.
 * Do not call after using deleteEventAndBackup or deleteMultipleEventsAndBackup.
 */
export function restoreCategoryFromBackup(dispatch: AppDispatch) {
    dispatch(categoriesActions.restoreBackup());
    dispatch(eventActions.restoreBackup());
}