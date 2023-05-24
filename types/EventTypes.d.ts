export type EventID = number;

export interface Event {
    name: string;
    date: Date;
    id: EventID;
}