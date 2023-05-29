const MONTH_NAMES = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_ABREV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_ABREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

class DateYMD {
    public year: number;
    public month: number;
    public date: number;

    constructor(year: number, month: number, date: number) {
        this.year = year;
        this.month = month;
        this.date = date;
    }

    toDate() {
        return new Date(this.year, this.month - 1, this.date);
    }

    toString() {
        return `${this.month}/${this.date}/${this.year}`;
    }

    monthName() {
        return MONTH_NAMES[this.month - 1];
    }

    monthNameAbrev() {
        return MONTH_NAMES_ABREV[this.month - 1];
    }

    dayName() {
        return DAY_NAMES[this.toDate().getDay()];
    }

    dayNameAbrev() {
        return DAY_NAMES_ABREV[this.toDate().getDay()];
    }

    isToday() {
        const today = new Date();
        return this.year == today.getFullYear()
            && this.month == (today.getMonth() + 1)
            && this.date == today.getDate();
    }

    equals(date: DateYMD) {
        return this.year == date.year
            && this.month == date.month
            && this.date == date.date;
    }

    isBefore(date: DateYMD) {
        return this.toDate().valueOf() < date.toDate().valueOf();
    }

    isAfter(date: DateYMD) {
        return this.toDate().valueOf() > date.toDate().valueOf();
    }

    addDays(numDays: number) {
        const _date = new Date(this.year, this.month - 1, this.date + numDays);

        return DateYMD.fromDate(_date);
    }

    subtractDays(numDays: number) {
        const _date = new Date(this.year, this.month - 1, this.date - numDays);

        return DateYMD.fromDate(_date);
    }

    static today() {
        let today = new Date();
        return new DateYMD(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }

    static fromDate(date: Date) {
        return new DateYMD(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }
}

export default DateYMD;