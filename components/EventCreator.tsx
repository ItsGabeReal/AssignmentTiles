import React, { forwardRef, useState, useRef, useImperativeHandle } from "react";
import { DueDate, Event, EventDetails } from "../types/store-current";
import EventInput, { RepeatSettings } from "./EventInput";
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
import DefaultModal from "./DefaultModal";
import { useAppDispatch, useAppSelector } from '../src/redux/hooks';
import { createEvent, createRepeatedEvents } from "../src/EventHelpers";
import { colors } from "../src/GlobalStyles";

export type EventCreatorRef = {
    /**
     * Opens the event creator modal with a pre-selected due date.
     */
    open: ((suggestedDueDate?: DateYMD) => void);
}

type EventCreatorProps = {
}

const EventCreator = forwardRef<EventCreatorRef, EventCreatorProps>((props, ref) => {
    const dispatch = useAppDispatch();
    const memorizedEventInput = useAppSelector(state => state.general.memorizedEventInput);

    const [visible, setVisible] = useState(false);

    const suggestedDueDate = useRef<DateYMD>();

    useImperativeHandle(ref, () => ({
        open(_suggestedDueDate?: DateYMD) {
            suggestedDueDate.current = _suggestedDueDate;
            setVisible(true);
        }
    }));

    function onSubmit(details: EventDetails, repeatSettings: RepeatSettings | null) {
        if (repeatSettings) {
            createRepeatedEvents(dispatch, details, repeatSettings);
        }
        else {
            createEvent(dispatch, details, suggestedDueDate.current);
        }
    }

    function close() {
        setVisible(false);
    }

    return (
        <DefaultModal visible={visible} onRequestClose={close} backgroundColor={colors.l1}>
            <EventInput
                mode='create'
                initialName={memorizedEventInput.name}
                initialDueDate={suggestedDueDate.current}
                initialCategoryID={memorizedEventInput.categoryID}
                onRequestClose={close}
                onSubmit={onSubmit}
            />
        </DefaultModal>
    );
});

export default EventCreator;