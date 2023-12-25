export default class Time extends Date {
    get seconds() {
        return Math.floor(this.getTime() / 1e3);
    }
    get minutes() {
        return Math.floor(this.getTime() / 6e4);
    }
    get hours() {
        return Math.floor(this.getTime() / 36e5);
    }
    get days() {
        return Math.floor(this.getTime() / 864e5);
    }
    get weeks() {
        return Math.floor(this.getTime() / 6048e5);
    }
    get months() {
        return Math.floor(this.getTime() / 2592e6);
    }
    get years() {
        return Math.floor(this.getTime() / 31104e6);
    }
    eval(timestamp) {
        if (typeof timestamp !== "string")
            return;
        const digits = timestamp.match(/(\d+)|(-\d+)/g)?.reverse();
        if (!digits || digits.length > 6)
            return;
        const map = [1e3, 6e4, 36e5, 864e5, 2592e6, 31104e6];
        const ms = digits.reduce((t, c, i) => (t += Number(c) * map[i]), 0);
        return new Time(1970, 0, 1, 0, 0, 0, this.getTime() + ms);
    }
    format(template, names = false) {
        if (typeof template !== "string")
            return;
        let format = template;
        const matched = {
            year: format.match(/year\[(\d|-\d)]/i)?.[0],
            month: format.match(/month\[(\d|-\d)]/i)?.[0],
            date: format.match(/(date|day|d+)\[(\d|-\d)]/i)?.[0],
            week: format.match(/(week|w+)\[(\d|-\d)]/i)?.[0],
            hour: format.match(/(hour|h+)\[(\d|-\d)]/i)?.[0],
            minute: format.match(/(minute|min|m+)\[(\d|-\d)]/i)?.[0],
            second: format.match(/(second|sec|s+)\[(\d|-\d)]/i)?.[0],
            ms: format.match(/ms\[(\d|-\d)]/i)?.[0],
        };
        const replace = (string, length) => length < 0
            ? string.slice(length)
            : length > string.length
                ? "0".repeat(length - string.length).concat(string)
                : string.slice(0, length);
        if (typeof matched.year === "string") {
            const year = this.getFullYear().toString();
            let length = Number(matched.year.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length > year.length)
                length = year.length;
            format = format.replace(matched.year, replace(year, length));
        }
        if (typeof matched.month === "string") {
            const month = names
                ? [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ][this.getMonth()]
                : (this.getMonth() + 1).toString();
            let length = Number(matched.month.match(/\d|-\d/)?.[0]);
            if (isNaN(length) ||
                length < 0 ||
                (length > month.length && isNaN(Number(month))))
                length = month.length;
            format = format.replace(matched.month, replace(month, length));
        }
        if (typeof matched.date === "string") {
            const day = this.getDate().toString();
            let length = Number(matched.date.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < day.length)
                length = day.length;
            format = format.replace(matched.date, replace(day, length));
        }
        if (typeof matched.week === "string") {
            const week = names
                ? [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ][this.getDay()]
                : Math.floor(this.getDate() / 7).toString();
            let length = Number(matched.week.match(/\d|-\d/)?.[0]);
            if (isNaN(length) ||
                length < 0 ||
                (length > week.length && isNaN(Number(week))))
                length = week.length;
            format = format.replace(matched.week, replace(week, length));
        }
        if (typeof matched.hour === "string") {
            const hour = this.getHours().toString();
            let length = Number(matched.hour.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < hour.length)
                length = hour.length;
            format = format.replace(matched.hour, replace(hour, length));
        }
        if (typeof matched.minute === "string") {
            const minute = this.getMinutes().toString();
            let length = Number(matched.minute.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < minute.length)
                length = minute.length;
            format = format.replace(matched.minute, replace(minute, length));
        }
        if (typeof matched.second === "string") {
            const second = this.getSeconds().toString();
            let length = Number(matched.second.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < second.length)
                length = second.length;
            format = format.replace(matched.second, replace(second, length));
        }
        if (typeof matched.ms === "string") {
            const ms = this.getMilliseconds().toString();
            let length = Number(matched.ms.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < ms.length)
                length = ms.length;
            format = format.replace(matched.ms, replace(ms, length));
        }
        return format;
    }
    toTimestamp() {
        return [
            this.getHours().toString(),
            this.getMinutes().toString(),
            this.getSeconds().toString(),
        ]
            .map((i) => (i.length === 2 ? i : "0".concat(i)))
            .join(":");
    }
    static toString() {
        const time = new Date();
        return [
            time.getHours().toString(),
            time.getMinutes().toString(),
            time.getSeconds().toString(),
        ]
            .map((i) => (i.length === 2 ? i : "0".concat(i)))
            .join(":");
    }
    static ms(timestamp) {
        if (typeof timestamp !== "string")
            return;
        const digits = timestamp.match(/(\d+)|(-\d+)/g)?.reverse();
        if (!digits || digits.length > 6)
            return;
        const map = [1e3, 6e4, 36e5, 864e5, 2592e6, 31104e6];
        return digits.reduce((t, c, i) => (t += Number(c) * map[i]), 0);
    }
    static seconds(timestamp) {
        const ms = this.ms(timestamp);
        if (typeof ms !== "number")
            return;
        return Math.floor(ms / 1e3);
    }
    static minutes(timestamp) {
        const ms = this.ms(timestamp);
        if (typeof ms !== "number")
            return;
        return Math.floor(ms / 6e4);
    }
    static hours(timestamp) {
        const ms = this.ms(timestamp);
        if (typeof ms !== "number")
            return;
        return Math.floor(ms / 36e5);
    }
    static days(timestamp) {
        const ms = this.ms(timestamp);
        if (typeof ms !== "number")
            return;
        return Math.floor(ms / 864e5);
    }
    static weeks(timestamp) {
        const ms = this.ms(timestamp);
        if (typeof ms !== "number")
            return;
        return Math.floor(ms / 6048e5);
    }
    static months(timestamp) {
        const ms = this.ms(timestamp);
        if (typeof ms !== "number")
            return;
        return Math.floor(ms / 2592e6);
    }
    static years(timestamp) {
        const ms = this.ms(timestamp);
        if (typeof ms !== "number")
            return;
        return Math.floor(ms / 31104e6);
    }
    static resolve(query) {
        if (query instanceof Date)
            return new Time(query);
        if (typeof query === "number")
            return new Time(1970, 0, 1, 0, 0, 0, query);
        if (typeof query !== "string")
            return;
        const time = new Time(query);
        if (!isNaN(time.getTime()))
            return time;
        const ms = this.ms(query);
        if (typeof ms !== "number")
            return;
        return new Time(1970, 0, 1, 0, 0, 0, ms);
    }
    static format(template, date, names = false) {
        if (typeof template !== "string" || !(date instanceof Date))
            return;
        let format = template;
        const matched = {
            year: format.match(/year\[(\d|-\d)]/i)?.[0],
            month: format.match(/month\[(\d|-\d)]/i)?.[0],
            date: format.match(/(date|day|d+)\[(\d|-\d)]/i)?.[0],
            week: format.match(/(week|w+)\[(\d|-\d)]/i)?.[0],
            hour: format.match(/(hour|h+)\[(\d|-\d)]/i)?.[0],
            minute: format.match(/(minute|min|m+)\[(\d|-\d)]/i)?.[0],
            second: format.match(/(second|sec|s+)\[(\d|-\d)]/i)?.[0],
            ms: format.match(/ms\[(\d|-\d)]/i)?.[0],
        };
        const replace = (string, length) => length < 0
            ? string.slice(length)
            : length > string.length
                ? "0".repeat(length - string.length).concat(string)
                : string.slice(0, length);
        if (typeof matched.year === "string") {
            const year = date.getFullYear().toString();
            let length = Number(matched.year.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length > year.length)
                length = year.length;
            format = format.replace(matched.year, replace(year, length));
        }
        if (typeof matched.month === "string") {
            const month = names
                ? [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ][date.getMonth()]
                : (date.getMonth() + 1).toString();
            let length = Number(matched.month.match(/\d|-\d/)?.[0]);
            if (isNaN(length) ||
                length < 0 ||
                (length > month.length && isNaN(Number(month))))
                length = month.length;
            format = format.replace(matched.month, replace(month, length));
        }
        if (typeof matched.date === "string") {
            const day = date.getDate().toString();
            let length = Number(matched.date.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < day.length)
                length = day.length;
            format = format.replace(matched.date, replace(day, length));
        }
        if (typeof matched.week === "string") {
            const week = names
                ? [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                ][date.getDay()]
                : Math.floor(date.getDate() / 7).toString();
            let length = Number(matched.week.match(/\d|-\d/)?.[0]);
            if (isNaN(length) ||
                length < 0 ||
                (length > week.length && isNaN(Number(week))))
                length = week.length;
            format = format.replace(matched.week, replace(week, length));
        }
        if (typeof matched.hour === "string") {
            const hour = date.getHours().toString();
            let length = Number(matched.hour.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < hour.length)
                length = hour.length;
            format = format.replace(matched.hour, replace(hour, length));
        }
        if (typeof matched.minute === "string") {
            const minute = date.getMinutes().toString();
            let length = Number(matched.minute.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < minute.length)
                length = minute.length;
            format = format.replace(matched.minute, replace(minute, length));
        }
        if (typeof matched.second === "string") {
            const second = date.getSeconds().toString();
            let length = Number(matched.second.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < second.length)
                length = second.length;
            format = format.replace(matched.second, replace(second, length));
        }
        if (typeof matched.ms === "string") {
            const ms = date.getMilliseconds().toString();
            let length = Number(matched.ms.match(/\d|-\d/)?.[0]);
            if (isNaN(length) || length < ms.length)
                length = ms.length;
            format = format.replace(matched.ms, replace(ms, length));
        }
        return format;
    }
}
