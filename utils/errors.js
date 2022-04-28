const DAYS = ['M', 'T', 'W', 'R', 'F', 'S', 'U']

const getErrors = (options, command) => {
  let errorMessage;

  switch(command) {
    case "enable-role-vote":
      if (options.frequency === "weekly" && (!options.day || !DAYS.includes(options.day))) {
        errorMessage = "Please specify a day using one of these abbreviations: M, T, W, R, F, S, U";
      } else if (options.frequency === "monthly" && (!options.date || options.date > 28 || options.date < 1)) {
        errorMessage = "Please specify a day of the month between 1 and 28";
      } else if (options.startTime === undefined || options.startTime > 2400 || options.startTime < 0) {
        errorMessage = "Please specify a start time between 0 and 2400 UTC";
      } else if (!options.periodLength || options.periodLength > 2440 || options.periodLength < 1) {
        errorMessage = "Please specify a voting period between 0 and 2440 minutes";
      } else if (!options.channelId) { 
        errorMessage = "Please specify a channel in which to post results";
      } else if (!options.roleId) {
        errorMessage = "Please specify which role will be voted on";
      } else if (!options.frequency === "daily" && options.periodLength > 1380) {
        errorMessage = "Daily votes should be 23 hours or less in duration."
      } else {
        return false;
      }
  }

  return errorMessage;
}

module.exports = getErrors;