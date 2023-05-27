export const ONE_DAY_IN_MILLISECONDS = 86400000;

export function datesMatch(date1: Date, date2: Date): boolean {
    return Math.floor(date1.valueOf() / ONE_DAY_IN_MILLISECONDS) == Math.floor(date2.valueOf() / ONE_DAY_IN_MILLISECONDS);
}

export function today(): Date {
    return new Date();
}

export function arraysEqual(array1: any[], array2: any[]): boolean {
    // length check
    if (array1.length != array2.length) return false;

    // content check
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) return false;
    }

    return true;
}

export function arrayMove(array: any[], from: number, to: number) {
    const movedElement = array[from];
    array.splice(from, 1, array[to]);
    array.splice(to, 1, movedElement);
}