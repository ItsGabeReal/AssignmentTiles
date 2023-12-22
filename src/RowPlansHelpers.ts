import { Vector2D } from "../types/General";
import { RowPlan, VisibleDaysState } from "../types/store-current";
import { DateYMDHelpers } from "./DateYMD";
import { getDayRowAtScreenPosition, getInsertionIndexFromGesture } from "./VisibleDaysHelpers";
import { getEventPlan, rowPlansActions } from "./redux/features/rowPlans/rowPlansSlice";
import { AppDispatch } from "./redux/store";

export function updateEventPlanFromDragPosition(
    dispatch: AppDispatch,
    visibleDays: VisibleDaysState,
    rowPlans: RowPlan[],
    scrollYOffset: number,
    draggedEventID: string,
    dragPosition: Vector2D,
) {
    const currentEventPlans = getEventPlan(rowPlans, draggedEventID);
    if (!currentEventPlans) {
        console.warn('RowPlansHelpers -> updateEventPlanFromDragPosition: Could not get event plan');
        return;
    }

    const overlappingRowDate = getDayRowAtScreenPosition(visibleDays, rowPlans, scrollYOffset, dragPosition);
    if (!overlappingRowDate) {
        console.error('RowPlansHelpers -> updateEventPlanFromDragPosition: Could not find row overlapping drop position');
        return;
    }

    const samePlannedDate = DateYMDHelpers.datesEqual(currentEventPlans.plannedDate, overlappingRowDate);

    const targetVisibleDaysIndex = visibleDays.findIndex(item => DateYMDHelpers.datesEqual(item, overlappingRowDate));
    if (targetVisibleDaysIndex == -1) {
        console.error('RowPlansHelpers -> updateEventPlanFromDragPosition: Could not find visible day with date matching', DateYMDHelpers.toString(overlappingRowDate));
        return;
    }

    let insertionIndex = getInsertionIndexFromGesture(visibleDays, rowPlans, scrollYOffset, targetVisibleDaysIndex, dragPosition);

    const numEventsInRow = rowPlans[currentEventPlans.rowPlansIndex].orderedEventIDs.length;

    /**
     * If a tile is dragged to the end of a row, the insertion index will
     * equal the index for the next element to be added. However, if the tile
     * is already in the row, this could cause a lot of unnecesary rerenders,
     * so whenever that's the case, decrement it back down to rowPlans.length - 1.
     */
    if (samePlannedDate && insertionIndex > numEventsInRow - 1) insertionIndex--;

    const insertionIndexChanged = insertionIndex !== currentEventPlans.rowOrder;

    if (!samePlannedDate || insertionIndexChanged) {
        dispatch(rowPlansActions.changePlannedDate({ eventID: draggedEventID, plannedDate: overlappingRowDate, insertionIndex }));
    }
}