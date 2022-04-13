const { Client, Intents, Collection } = require("discord.js");
const Vote = require('../lib/Vote');
const { setTimeout: promiseTimeout } = require('timers/promises');
require('dotenv').config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
  partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
});

client.login(process.env.AVERAGE_BOT_TOKEN)

describe("Vote", () => {
  let guild;
  let vote;

  beforeAll(async () => {
    guild = await client.guilds.fetch("876629005879631942");
    vote = new Vote(client, guild, "892601190980919308")
  });

  describe("initialize", () => {
    test("it creates channels", async () => {
      const channelSpy = jest.spyOn(vote, "createChannelFor");

      return await expect(vote.initialize()).toBe(true);
    })
  })
});