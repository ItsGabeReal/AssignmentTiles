import React, { useContext } from "react"
import { EventDetails } from "../types/EventTypes"
import EventInputModal from "./EventInput"
import DateYMD from "../src/DateYMD";
import DefaultModal from "./DefaultModal";
import EventDataContext from "../context/EventDataContext";

type EventCreatorProps = {
    visible: boolean;

    initialDueDate?: DateYMD;

    onRequestClose: (() => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    const eventData = useContext(EventDataContext);

    function onSubmit(newEvent: EventDetails) {
        eventData.dispatch({
            type: 'add',
            newEvent: newEvent,
        });
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