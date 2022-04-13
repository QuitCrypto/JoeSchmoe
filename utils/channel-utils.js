const { Permissions } = require("discord.js");
const fs = require('fs');


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
  });

  return channel;
}

module.exports = {
  createChannelFor: createChannelFor
}