import moment from "moment";

export const getAllDateInMonth = (yearMonthDate) =>
    [...new Array(moment(yearMonthDate, "YYYYMM").daysInMonth())].map(
        (_, index) =>
            yearMonthDate
                .split("")
                .map((char, index) => {
                    if (index === 4) {
                        return `-${char}`;
                    }
                    return char;
                })
                .join("")
                .concat(`-${`${index + 1}`.padStart(2, "0")}`)
    );

export const getFlightDateForChatBot = (flight) => {
    const momentDepartureDate = moment(flight.departure.date);
    return momentDepartureDate
                .format("DD-MM").replace("-", "\\-")
}

export const getFlightDateUnixTime = (flight) => {
    const momentDepartureDate = moment(flight.departure.date);
    return momentDepartureDate
                .valueOf()
}
