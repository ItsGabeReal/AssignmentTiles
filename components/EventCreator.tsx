import React, { useRef } from "react"
import { CategoryID, Event, EventDetails } from "../types/EventTypes"
import EventInput, { RepeatSettings } from "./EventInput"
import DateYMD, { DateYMDHelpers } from "../src/DateYMD";
import DefaultModal from "./DefaultModal";
import { useAppDispatch } from '../src/redux/hooks';
import { createEvent } from "../src/EventHelpers";

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

    function onSubmit(details: EventDetails, repeatSettings: RepeatSettings | null) {
        if (repeatSettings) {
            for (let i = 0; i < repeatSettings.recurrences; i++) {
                let dueDate = details.dueDate || DateYMDHelpers.today();
                if (repeatSettings.valueType === 'days') dueDate = DateYMDHelpers.addDays(dueDate, i * repeatSettings.value);

                const repeatedEventDetails: EventDetails = {
                    ...details,
                    dueDate,
                }
                createEvent(dispatch, repeatedEventDetails, dueDate);
            }
        }
        else {
            createEvent(dispatch, details, props.initialDueDate);
        }

        lastUsedName.current = details.name;
        lastUsedCategory.current = details.categoryID;
    }

    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInput
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