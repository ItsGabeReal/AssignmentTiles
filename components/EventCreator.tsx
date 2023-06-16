import React, { useContext } from "react"
import { Event } from "../types/EventTypes"
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

    function onSubmit(newEvent: Event) {
        dispatch(addEvent({ event: newEvent }));

        const plannedDate = getInitialPlannedDateForEvent(newEvent);
        dispatch(insertEventInRowPlans({ eventID: newEvent.id, plannedDate: plannedDate }));
    }

    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInputModal
                visible={props.visible}
                submitButtonTitle="Create"
                initialDueDate={props.initialDueDate}
                onRequestClose={props.onRequestClose}
                onSubmit={onSubmit}
            />
        </DefaultModal>
    );
}

export default EventCreator;