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