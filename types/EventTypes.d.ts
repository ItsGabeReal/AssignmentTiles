import DateYMD from "../src/DateYMD";

export interface EventDetails {
    name: string;
    completed: boolean;
    id: string;
    dueDate?: DateYMD;
}

export interface RowEvents {
    date: DateYMD;
    events: EventDetails[];
}