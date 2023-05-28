import React from "react"
import { EventDetails } from "../types/EventTypes"
import EventInputModal from "./EventInputModal"
import DateYMD from "../src/DateMDY";
import { Modal } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Platform } from "react-native";

type EventCreatorProps = {
    visible: boolean;

    initialDueDate?: DateYMD;

    onRequestClose: (() => void);

    onSubmit: ((eventDetails: EventDetails) => void);
}

const EventCreator: React.FC<EventCreatorProps> = (props) => {
    return (
        <EventInputModal
            visible={props.visible}
            submitButtonTitle="Create Event"
            initialDueDate={props.initialDueDate}
            onRequestClose={props.onRequestClose}
            onSubmit={props.onSubmit}
        />
    );
}

export default EventCreator;