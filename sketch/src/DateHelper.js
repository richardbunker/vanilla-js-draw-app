export const currentDateTime = () => {
    return currentDate() + " at " + currentTime();
};

export const currentDateTimeFromCarbon = (dateInCarbonFormat) => {
    return (
        formatDateToString(dateInCarbonFormat) +
        " at " +
        formatTimeString(dateInCarbonFormat)
    );
};

export const currentTime = () => {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
};

export const currentDate = () => {
    const date = new Date();
    let dateString =
        ("0" + date.getDate()).slice(-2) +
        "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "/" +
        date.getFullYear();
    return dateString;
};

export const formatDateToString = (value) => {
    const date = new Date(value);
    let dateString =
        ("0" + date.getDate()).slice(-2) +
        "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "/" +
        date.getFullYear();
    return dateString;
};

export const formatTimeString = (value) => {
    const date = new Date(value);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
};

export const datefilter = (date) => {
    let dateString =
        date.getFullYear() +
        "-" +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + date.getDate()).slice(-2);
    return dateString;
};

export const returnDateObjectFromDateString = (dateString) => {
    let dateParts = dateString.split("/");
    let dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    return dateObject;
};

export const returnCarbonDateStringFormat = (dateString) => {
    return datefilter(returnDateObjectFromDateString(dateString));
};
