// Returns number of seconds since January 1, 1970 UTC
export function getUnixTimestamp() {
    return Math.floor((new Date()).getTime() / 1000);
}

// Generates a unique id by generating a random number
export function generateUID() {
    let id = Math.random().toString();
    id = id.substring(2, id.length-1); // Cut off leading "0."
    return id;
}
