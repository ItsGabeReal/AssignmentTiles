export type RowID = number;

export interface Row {
    date: Date;
    eventIDs: EventID[];
    id: RowID;
}