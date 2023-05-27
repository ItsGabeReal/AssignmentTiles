import DateYMD from "../src/DateMDY";

export interface EventDetails {
    name: string;
    id: string;
    dueDate?: DateYMD;
}

export interface RowEvents {
    date: DateYMD;
    events: EventDetails[];
}