const { Client, Intents, Collection } = require("discord.js");

require('dotenv').config();
const RolePoll = require("../lib/RolePoll");
const Vote = require('../lib/Vote')
const Time = require('../utils/time')
jest.mock('../lib/Vote')

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
  partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
});

client.login(process.env.AVERAGE_BOT_TOKEN)

describe("RolePoll", () => {
  let guild;
  let poll;
  let addedZero;

  beforeAll(async () => {
    guild = await client.guilds.fetch("876629005879631942");
    poll = new RolePoll(
      client,
      guild,
      {
        "roleId": "876641676695859300",
        "channelId": "876635387395702814",
        "frequency": null,
        "startTime": null,
        "day": null,
        "date": null,
      }
    );
    addedZero = new Date().getUTCMinutes() >= 10 ? "" : "0";
  });

  describe("When the frequency is daily", () => {
    beforeEach(() => {
      poll.frequency = "daily";
      Time.mockClear;
      jest.useFakeTimers();
    });

    const getUTCDateForTimeSpy = jest.spyOn(Time, "getUTCDateForTime")

    test("When the start time is one minute in the future", () => {
      poll.startTime = parseFloat(`${new Date().getUTCHours()}${addedZero}${new Date().getUTCMinutes()}`) + 1;
      expect(poll.timeUntilVote()).toBe("00h01m00s");
      expect(getUTCDateForTimeSpy).toBeCalled();
    })

    test("When the start time is one minute in the past", () => { 
      poll.startTime = parseFloat(`${new Date().getUTCHours()}${addedZero}${new Date().getUTCMinutes()}`) - 1;

      expect(poll.timeUntilVote()).toBe("23h59m00s");
      expect(getUTCDateForTimeSpy).toBeCalled();
    })

    test("When the start time is now", () => {
      const startVoteSpy = jest.spyOn(poll, "startVote")
      poll.startTime = parseFloat(`${new Date().getUTCHours()}${addedZero}${new Date().getUTCMinutes()}`);

      expect(startVoteSpy).not.toBeCalled();
      expect(poll.timeUntilVote()).toBe("00h00m00s");

      jest.runAllTimers();
      expect(startVoteSpy).toBeCalled();
    });
  });

  describe("When the frequency is weekly", () => {
    beforeEach(() => {
      poll.frequency = "weekly";
      jest.useFakeTimers();
    });

    test("When the start time is one minute in the future", () => {
      const days = ["U", "M", "T", "W", "R", "F", "S"]
      poll.startTime = parseFloat(`${new Date().getUTCHours()}${addedZero}${new Date().getUTCMinutes()}`);
      poll.day = days[new Date().getUTCDay() + 1]
      const getUTCDateForDaySpy = jest.spyOn(Time, "getUTCDateForDay")

      expect(poll.timeUntilVote()).toBe("24h00m00s");
      expect(getUTCDateForDaySpy).toBeCalled();
    })
  });

  describe("When the frequency is monthly", () => {
    beforeEach(() => {
      poll.frequency = "monthly";
      jest.useFakeTimers();
    });

    test("When the start time is one minute in the future", () => {
      poll.startTime = parseFloat(`${new Date().getUTCHours()}${addedZero}${new Date().getUTCMinutes()}`);
      poll.date = (new Date().getUTCDate() + 2)
      const getUTCDateForDateSpy = jest.spyOn(Time, "getUTCDateForDate")

      expect(poll.timeUntilVote()).toBe("48h00m00s");
      expect(getUTCDateForDateSpy).toBeCalled();
    })
  });

});