const MONTH_NAMES = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_ABREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_ABREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export namespace DateYMDHelpers {
    export function toDate(date: DateYMD) {
        return new Date(date.year, date.month - 1, date.date);
    }

    export function toString(date?: DateYMD | null) {
        if (date === null) return 'null DateYMD';
        if (date === undefined) return 'undefined DateYMD';

        return `${date.month}/${date.date}/${date.year}`;
    }

    export function monthName(date: DateYMD) {
        return MONTH_NAMES[date.month - 1];
    }

    export function monthNameAbrev(date: DateYMD) {
        return MONTH_NAMES_ABREV[date.month - 1];
    }

    export function dayName(date: DateYMD) {
        return DAY_NAMES[toDate(date).getDay()];
    }

    export function dayNameAbrev(date: DateYMD) {
        return DAY_NAMES_ABREV[toDate(date).getDay()];
    }

    export function isToday(date: DateYMD) {
        const today = new Date();
        return date.year === today.getFullYear()
            && date.month === (today.getMonth() + 1)
            && date.date === today.getDate();
    }

    export function datesEqual(dateA: DateYMD | null | undefined, dateB: DateYMD | null | undefined) {
        // If one if the dates is undfined, return true if either they're both null, or both undefined.
        if (!dateA || !dateB) {
            return (dateA === null && dateB === null) || (dateA === undefined && dateB === undefined);
        }

        return dateA.year === dateB.year
            && dateA.month === dateB.month
            && dateA.date === dateB.date;
    }

    export function daysBefore(date: DateYMD, comparedDate: DateYMD) {
        const oneDayInMilliseconds = 86_400_000;
        const millisecondsBetween = toDate(date).getTime() - toDate(comparedDate).getTime();
        return Math.round(millisecondsBetween / oneDayInMilliseconds);
    }

    export function addDays(date: DateYMD, numDays: number) {
        const _date = new Date(date.year, date.month - 1, date.date + numDays);

        return fromDate(_date);
    }

    export function subtractDays(date: DateYMD, numDays: number) {
        const _date = new Date(date.year, date.month - 1, date.date - numDays);

        return fromDate(_date);
    }

    export function today() {
        return fromDate(new Date());
    }

    export function fromDate(date: Date) {
        return { year: date.getFullYear(), month: date.getMonth() + 1, date: date.getDate() } as DateYMD;
    }

    export function createSequentialDateArray(startDate: DateYMD, numDays: number) {
        const outputDates: DateYMD[] = [];

        for (let i = 0; i < numDays; i++) {
            outputDates.push(addDays(startDate, i));
        }

        return outputDates;
    }
}

export type DateYMD = { year: number, month: number, date: number };

export default DateYMD;