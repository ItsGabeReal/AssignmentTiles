import React from "react";
import { Event, EventDetails } from "../types/v0";
import EventInput, { RepeatSettings } from "./EventInput";
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
import DefaultModal from "./DefaultModal";
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { createEvent, createRepeatedEvent } from "../src/EventHelpers";
import { colors } from "../src/GlobalStyles";

type EventCreatorProps = {
    visible: boolean;

    /**
     * The value due date will be set to when visible is
     * set to true.
     */
    initialDueDate?: DateYMD;

    /**
     * Called when the modal wants to close. Should set visible to false.
     */
    onRequestClose: (() => void);

    /**
     * Called when a new event is created.
     */
    onEventCreated?: ((createdEvent: Event) => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    const dispatch = useAppDispatch();
    const memorizedEventInput = useAppSelector(state => state.general.memorizedEventInput);

    function onSubmit(details: EventDetails, repeatSettings: RepeatSettings | null) {
        if (repeatSettings) {
            createRepeatedEvent(dispatch, details, repeatSettings);
        }
        else {
            createEvent(dispatch, details, props.initialDueDate);
        }
    }

    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose} backgroundColor={colors.l1}>
            <EventInput
                visible={props.visible}
                mode='create'
                initialName={memorizedEventInput.name}
                initialDueDate={props.initialDueDate}
                initialCategoryID={memorizedEventInput.categoryID}
                onRequestClose={props.onRequestClose}
                onSubmit={onSubmit}
            />
        </DefaultModal>
    );
}

export default EventCreator;