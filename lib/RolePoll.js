const Time = require("../utils/time")
const Vote = require("./Vote")
const fs = require('fs');
const { getEmbedsFrom } = require("../utils/embed-utils");

const ROLE_POLLS = []; 

class RolePoll {
  constructor(client, guild, options) {
    this.roleId = options.roleId;
    this.channelId = options.channelId;
    this.frequency = options.frequency;
    this.startTime = options.startTime;
    this.periodLength = options.periodLength;
    this.endTime = null;
    this.day = options.day;
    this.date = options.date;
    this.guild = guild;
    this.client = client;
    this.vote = null;
    this.scheduleAndGetTimeUntilVote = this.scheduleAndGetTimeUntilVote.bind(this);
    this.startVote = this.startVote.bind(this);
    this.deleteVotingChannels = this.deleteVotingChannels.bind(this);
    this.summarize = this.initialize.bind(this);
    this.nextVoteDateTime = this.nextVoteDateTime.bind(this);
    this.runAtDate = this.runAtDate.bind(this);
    this.save = this.save.bind(this);
    this.setReminder = this.setReminder.bind(this);
  }

  static all() {
    return ROLE_POLLS;
  }

  static delete(instance) {
    const index = ROLE_POLLS.indexOf(instance);
    ROLE_POLLS.splice(index, 1);
  }

  async initialize(newlyCreated = true) {
    this.setEndTime();

    if (newlyCreated) {
      const channel = await this.guild.channels.fetch(this.channelId);
      channel.send(`A vote for <@&${this.roleId}> has been set up to occur here, ${this.frequency} at ${this.startTime} UTC.  The next vote will occur in ${this.scheduleAndGetTimeUntilVote()}`);
    } else {
      this.scheduleAndGetTimeUntilVote();
    }

    ROLE_POLLS.push(this);
  }

  setEndTime() {
    const hours = Math.floor(this.periodLength / 60)
    const minutes = this.periodLength % 60;

    this.endTime = this.startTime + (hours * 100) + minutes;
  }

  nextVoteDateTime(time = this.startTime) {
    let dateTime;

    switch(this.frequency) {
      case "daily":
        dateTime = Time.getUTCDateForTime(time);
        break;
      case "monthly":
        dateTime = Time.getUTCDateForDate(this.date, time);
        break;
      case "weekly":
        dateTime = Time.getUTCDateForDay(this.day, time);
        break;
    }

    return dateTime;
  }

  scheduleAndGetTimeUntilVote() {
    const nextVoteDateTime = this.nextVoteDateTime();
    this.runAtDate(Time.msUntil(nextVoteDateTime), this.startVote);

    return Time.timeUntil(nextVoteDateTime);
  }

  // https://stackoverflow.com/a/18182660
  runAtDate(msUntilDate, func) {
    if (msUntilDate > 0x7FFFFFFF) //setTimeout limit is MAX_INT32=(2^31-1)
        setTimeout(() => { runAtDate(msUntilDate - 0x7FFFFFFF, func) }, 0x7FFFFFFF);
    else
        setTimeout(func, msUntilDate);
  }

  startVote() {
    if (!ROLE_POLLS.includes(this)) return;

    this.vote = new Vote(this.client, this.guild, this.roleId, this.periodLength);
    this.vote.initialize();
    this.setReminder();
    this.runAtDate(this.periodLength * 60 * 1000, this.deleteVotingChannels);
  }

  setReminder() {
    const voteEndTenMinuteWarning = this.nextVoteDateTime(this.endTime);
    voteEndTenMinuteWarning.setUTCMinutes(voteEndTenMinuteWarning.getUTCMinutes() - 10);

    if (this.periodLength > 10) {
      this.runAtDate(Time.msUntil(voteEndTenMinuteWarning), this.vote.remindAll);
    }
  }

  async deleteVotingChannels() {
    const results = this.vote.end();
    this.save(results);

    const channel = await this.guild.channels.fetch(this.channelId);
    const voteResultString = await Vote.getVoteResultString(this.guild, results);
    const resultsWithDate = {
      [new Date().toDateString()]: {
        results,
        periodLength: this.periodLength,
        numParticipants: this.vote.numParticipants
      }
    }
    const embeds = await getEmbedsFrom(resultsWithDate, this.roleId, this.guild);
    channel.send({ content: `Vote for <@&${this.roleId}> concluded.\n\n**Results:**\n${voteResultString}\n\nThe next vote will occur in ${this.scheduleAndGetTimeUntilVote()}.`, embeds });
  }

  save(results) {
    const allResults = JSON.parse(fs.readFileSync("./db/vote-results.json"));
    const guildResults = allResults[this.guild.id] ||= {}
    guildResults[this.roleId] ||= {};
    guildResults[this.roleId][new Date().toDateString()] = {
      results,
      periodLength: this.periodLength,
      numParticipants: this.vote.numParticipants
    }

    fs.writeFileSync('./db/vote-results.json', JSON.stringify(allResults));
  }
}

module.exports = RolePoll;