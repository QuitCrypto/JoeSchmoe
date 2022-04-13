// https://stackoverflow.com/a/14764908
const timeUntil = (d) => {
  // Utility to add leading zero
  function z(n, sym) {
    if (n === 0) return "";
    return (n < 10? '0' : '') + n + sym;
  }

  // Convert string to date object
  // var d = isoToObj(s);
  var ms = msUntil(d);

  // Allow for previous times
  var sign = ms < 0? '-' : '';
  ms = Math.abs(ms);

  // Get time components
  // var hours = diff/3.6e6 | 0;
  // var mins  = diff%3.6e6 / 6e4 | 0;
  // var secs  = Math.round(diff%6e4 / 1e3);
  const days = Math.floor(ms / (24*60*60*1000));
  const daysms = ms % (24*60*60*1000);
  const hours = Math.floor(daysms / (60*60*1000));
  const hoursms = ms % (60*60*1000);
  const mins = Math.floor(hoursms / (60*1000));
  const minutesms = ms % (60*1000);
  const secs = Math.floor(minutesms / 1000);

  if (secs === 60) {
    mins += 1;
    secs = 0;
  }

  if (mins === 60) {
    hours += 1;
    mins = 0
  }
  // Return formatted string
  return `${sign}${z(days, "d")}${z(hours, "h")}${z(mins, "m")}${z(secs, "s")}`;   
}

const msUntil = (d) => {
  return d - new Date();
}

const getUTCDateForTime = (startTime, refDate = new Date()) => {
  let startHour = parseInt(startTime / 100);
  refDate.setUTCHours(startHour);
  refDate.setUTCMinutes(startTime - startHour * 100);
  refDate.setUTCSeconds(0);

  if (refDate - new Date() < 0) {
    let date = new Date().getUTCDate();
    refDate.setUTCDate(date + 1);
  }

  return refDate;
}

// https://stackoverflow.com/a/54437356
const getUTCDateForDate = (date, startTime, refDate = new Date()) => {
  let startHour = parseInt(startTime / 100);
  refDate.setUTCHours(startHour);
  refDate.setUTCMinutes(startTime - startHour * 100)
  refDate.setUTCDate(date);
  refDate.setUTCSeconds(0);

  if (refDate - new Date() < 0) {
    let month = new Date().getUTCMonth();
    refDate.setUTCMonth(month + 1);
  }

  return refDate;
}

const getUTCDateForDay = (day, startTime, excludeToday = false, refDate = new Date()) => {
  const dayOfWeek = ["U","M","T","W","R","F","S"]
                    .indexOf(day);
  if (dayOfWeek < 0) return;

  let startHour = parseInt(startTime / 100);
  refDate.setUTCHours(startHour);
  refDate.setUTCMinutes(startTime - startHour * 100)
  refDate.setUTCDate(refDate.getUTCDate() + +!!excludeToday + 
                  (dayOfWeek + 7 - refDate.getUTCDay() - +!!excludeToday) % 7);
  refDate.setUTCSeconds(0);

  return refDate;
}

module.exports = { 
  timeUntil: timeUntil,
  msUntil: msUntil,
  getUTCDateForDay: getUTCDateForDay,
  getUTCDateForDate: getUTCDateForDate,
  getUTCDateForTime: getUTCDateForTime
}