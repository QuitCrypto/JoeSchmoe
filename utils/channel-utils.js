const { Permissions } = require("discord.js");
const fs = require('fs');
const GUILD_VOTING_CATEGORY_IDS = JSON.parse(fs.readFileSync("./db/channel-category-mappings.json"));

const createChannelFor = async (guild, member, client) => {
  const everyoneRole = guild.roles.everyone;
  const channel = await guild.channels.create(member.user.username, {
      type: 'GUILD_TEXT',
      permissionOverwrites: [
          {
              id: everyoneRole.id,
              deny: [Permissions.FLAGS.VIEW_CHANNEL]
          },
          {
              id: member.id,
              allow: [Permissions.FLAGS.VIEW_CHANNEL]
          },
          {
              id: client.user.id,
              allow: [Permissions.FLAGS.VIEW_CHANNEL]
          }
      ],
      parent: GUILD_VOTING_CATEGORY_IDS[guild.id]
  });

  return channel;
}

module.exports = {
  createChannelFor: createChannelFor
}