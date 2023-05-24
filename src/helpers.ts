export function datesMatch(date1: Date, date2: Date): boolean {
    const ONE_DAY_IN_MILLISECONDS = 86400000;
    return Math.floor(date1.valueOf() / ONE_DAY_IN_MILLISECONDS) == Math.floor(date2.valueOf() / ONE_DAY_IN_MILLISECONDS);
}

export function today(): Date {
    return new Date();
}

export function getItemFromID(items: any[], id: number): any {
    return items.find(item => item.id == id);
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