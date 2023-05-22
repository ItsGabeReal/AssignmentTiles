export function datesMatch(date1, date2) {
    const ONE_DAY_IN_MILLISECONDS = 86400000;
    return Math.floor(date1.valueOf() / ONE_DAY_IN_MILLISECONDS) == Math.floor(date2.valueOf() / ONE_DAY_IN_MILLISECONDS);
}

export function today() {
    return new Date();
}

export function getItemFromID(items, id) {
    return items.find(item => item.id == id);
}

export function propProvided(prop) {
    if (prop) return true;
    else return false;
}

export function arraysEqual(array1, array2) {
    // length check
    if (array1.length != array2.length) return false;

    // content check
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) return false;
    }

    return true;
}