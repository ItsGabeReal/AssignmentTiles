import React from "react"
import { EventDetails } from "../types/EventTypes"
import EventInput from "./EventInput"
import DateYMD from "../src/DateMDY";
import { Modal } from "react-native";

type EventCreatorProps = {
    visible: boolean;

    initialDueDate?: DateYMD;

    onSubmit: ((eventDetails: EventDetails) => void);

    onRequestClose: (() => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    return (
        <Modal
            animationType="slide"
            visible={props.visible}
            onRequestClose={props.onRequestClose}
            presentationStyle="pageSheet"
        >
            <EventInput submitButtonTitle="Create Event"
                initialDueDate={props.initialDueDate}
                onSubmit={props.onSubmit} />
        </Modal>
    );
}

export default EventCreator;