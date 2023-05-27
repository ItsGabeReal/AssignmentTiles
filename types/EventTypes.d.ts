export interface EventDetails {
    name: string;
    id: string;
    dueDate?: Date;
}

export interface RowEvents {
    date: Date;
    events: EventDetails[];
}