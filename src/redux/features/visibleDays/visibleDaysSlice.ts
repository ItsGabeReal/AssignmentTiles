import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DateYMDHelpers } from '../../../DateYMD';
import { VisibleDaysState } from '../../../../types/v0';

export const visibleDaysSlice = createSlice({
    name: 'visibleDays',
    initialState: initializeVisibleDays(),
    reducers: {
        addDaysToBottom(state, action: PayloadAction<{numNewDays: number}>) {
            const currentLastDate = state[state.length - 1];
            const startDate = DateYMDHelpers.addDays(currentLastDate, 1);
            const newDates = DateYMDHelpers.createSequentialDateArray(startDate, action.payload.numNewDays);

            arrayAppendAfter(state, newDates);
        },
        addDaysToTop(state, action: PayloadAction<{numNewDays: number}>) {
            const currentFirstDate = state[0];
            const startDate = DateYMDHelpers.subtractDays(currentFirstDate, action.payload.numNewDays);
            const newDates = DateYMDHelpers.createSequentialDateArray(startDate, action.payload.numNewDays);

            arrayAppendBefore(state, newDates);
        },
    },
});

function arrayAppendBefore(array: any[], appendedArray: any[]) {
    for (let i = appendedArray.length - 1; i >= 0; i--) {
        array.unshift(appendedArray[i]);
    }
}

function arrayAppendAfter(array: any[], appendedArray: any[]) {
    appendedArray.forEach(item => array.push(item));
}

function initializeVisibleDays() {
    const numDaysAboveToday = 7 * 2;
    const numDaysBelowToday = 7 * 3 - 1;

    const totalDays = numDaysAboveToday + 1 + numDaysBelowToday;
    const startDate = DateYMDHelpers.subtractDays(DateYMDHelpers.today(), numDaysAboveToday);

    return DateYMDHelpers.createSequentialDateArray(startDate, totalDays) as VisibleDaysState;
}

export const visibleDaysActions = visibleDaysSlice.actions;

export default visibleDaysSlice.reducer;