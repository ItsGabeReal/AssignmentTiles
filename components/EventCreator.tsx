import React from "react"
import { EventDetails } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DateYMD from "../src/DateYMD";
import DefaultModal from "./DefaultModal";

type EventCreatorProps = {
    visible: boolean;

    initialDueDate?: DateYMD;

    onRequestClose: (() => void);

    onSubmit: ((eventDetails: EventDetails) => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    return (
        <DefaultModal visible={props.visible} onRequestClose={props.onRequestClose}>
            <EventInputModal
                visible={props.visible}
                submitButtonTitle="Create Event"
                initialDueDate={props.initialDueDate}
                onRequestClose={props.onRequestClose}
                onSubmit={props.onSubmit}
            />
        </DefaultModal>
    );
}

export default EventCreator;