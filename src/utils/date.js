module.exports = {
  getDifference: (date1, date2) => {
    const dateDifferenceMills = date1 - date2;

    const differenceInDays = Math.floor(
      dateDifferenceMills / (1000 * 60 * 60 * 24)
    );

    const differenceInHours = Math.floor(
      dateDifferenceMills / (1000 * 60 * 60) - differenceInDays * 24
    );

    const differenceInMinutes = Math.floor(
      dateDifferenceMills / (1000 * 60) - differenceInHours * 60
    );

    const differenceInSeconds =
      Math.floor(dateDifferenceMills / 1000) - differenceInMinutes * 60;

    const differenceInMilliseconds =
      Math.floor(differenceInSeconds / 1000) - differenceInSeconds * 1000;

    return {
      days: differenceInDays,
      hours: differenceInHours,
      minutes: differenceInMinutes,
      seconds: differenceInSeconds,
      milliseconds: differenceInMilliseconds,
    };
  },
};
