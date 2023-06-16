import React, { useRef } from "react"
import { CategoryID, Event } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DateYMD from "../src/DateYMD";
import DefaultModal from "./DefaultModal";
import { useAppDispatch } from '../src/redux/hooks';
import { addEvent } from "../src/redux/features/events/eventsSlice";
import { getInitialPlannedDateForEvent, insertEventInRowPlans } from "../src/redux/features/rowPlans/rowPlansSlice";

type EventCreatorProps = {
    visible: boolean;

    initialDueDate?: DateYMD;

    onRequestClose: (() => void);

    onEventCreated?: ((createdEvent: Event) => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    const dispatch = useAppDispatch();

    const lastUsedName = useRef('');
    const lastUsedCategory = useRef<CategoryID>(null);

    function onSubmit(newEvent: Event) {
        dispatch(addEvent({ event: newEvent }));

        const plannedDate = props.initialDueDate || getInitialPlannedDateForEvent(newEvent);
        dispatch(insertEventInRowPlans({ eventID: newEvent.id, plannedDate }));

        lastUsedName.current = newEvent.name;
        lastUsedCategory.current = newEvent.categoryID;
    }

    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInputModal
                visible={props.visible}
                initialName={lastUsedName.current}
                initialDueDate={props.initialDueDate}
                initialCategoryID={lastUsedCategory.current}
                onRequestClose={props.onRequestClose}
                onSubmit={onSubmit}
            />
        </DefaultModal>
    );
}

export default EventCreator;