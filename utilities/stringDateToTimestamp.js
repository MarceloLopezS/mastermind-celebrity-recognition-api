const stringDateToTimestamp = (stringDate) => {
    return new Date(stringDate).getTime();
}

export default stringDateToTimestamp;