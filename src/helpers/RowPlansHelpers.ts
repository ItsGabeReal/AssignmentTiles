import { Vector2D } from "../../types/General";
import { RowPlan, VisibleDaysState } from "../../types/store-current";
import { DateYMDHelpers } from "../DateYMD";
import { getDayRowAtScreenPosition, getInsertionIndexFromGesture } from "./VisibleDaysHelpers";
import { getEventPlan, rowPlansActions } from "../redux/features/rowPlans/rowPlansSlice";
import { AppDispatch } from "../redux/store";

// Updates the row plan for an event if nescesary. Should be called for each update in the drag loop.
export function updateEventPlanFromDragPosition(
    dispatch: AppDispatch,
    visibleDays: VisibleDaysState,
    rowPlans: {[key: string]: RowPlan},
    scrollYOffset: number,
    draggedEventID: string,
    dragPosition: Vector2D,
) {
    const currentEventPlan = getEventPlan(rowPlans, draggedEventID);
    if (!currentEventPlan) {
        console.warn('RowPlansHelpers -> updateEventPlanFromDragPosition: Could not get event plan');
        return;
    }

    const overlappingRowIndex = getDayRowAtScreenPosition(visibleDays, rowPlans, scrollYOffset, dragPosition);
    const overlappingRowDate = visibleDays[overlappingRowIndex];

    const samePlannedDate = DateYMDHelpers.datesEqual(currentEventPlan.plannedDate, overlappingRowDate);

    const targetVisibleDaysIndex = visibleDays.findIndex(item => DateYMDHelpers.datesEqual(item, overlappingRowDate));
    if (targetVisibleDaysIndex == -1) {
        console.error('RowPlansHelpers -> updateEventPlanFromDragPosition: Could not find visible day with date matching', DateYMDHelpers.toString(overlappingRowDate));
        return;
    }

    let insertionIndex = getInsertionIndexFromGesture(visibleDays, targetVisibleDaysIndex, rowPlans, scrollYOffset, dragPosition);

    const overlappingRowPlansKey = DateYMDHelpers.toString(overlappingRowDate);
    const numEventsInRow = rowPlans[overlappingRowPlansKey] ? rowPlans[overlappingRowPlansKey].orderedEventIDs.length : 0;

    /**
     * The insertion index might not be valid if the tile is dragged beyond the end of the row.
     * Also, we must handle the edge case where the tile is already in the row.
     */
    if (insertionIndex > numEventsInRow - 1) {
        insertionIndex = (samePlannedDate ? numEventsInRow - 1 : numEventsInRow);
    }

    const insertionIndexChanged = insertionIndex !== currentEventPlan.rowOrder;

    if (!samePlannedDate || insertionIndexChanged) {
        dispatch(rowPlansActions.changePlannedDate({ eventID: draggedEventID, plannedDate: overlappingRowDate, insertionIndex }));
    }
}
