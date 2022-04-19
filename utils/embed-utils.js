const QuickChart = require("quickchart-js");
const Vote = require('../lib/Vote');
const { MessageEmbed } = require("discord.js");

const createGuildEmbeds = async (guild, guildResults) => {
  let embeds = []

  for (let k = 0; k < Object.entries(guildResults).length; k++) {
    const [roleId, resultsHash] = Object.entries(guildResults)[k];

    embeds = embeds.concat(await getEmbedsFrom(resultsHash, roleId, guild))
    console.log(embeds);
  }

  return embeds
}

const createUserEmbeds = async (guild, guildResults, userId) => {
  let embeds = []

  for (let k = 0; k < Object.entries(guildResults).length; k++) {
    const [roleId, resultsHash] = Object.entries(guildResults)[k];
    const caller = await guild.members.fetch(userId);

    if (!caller.roles.cache.has(roleId)) continue;

    embeds = embeds.concat(await getEmbedsFrom(resultsHash, roleId, guild))
  }

  return embeds
}

const createRoleEmbeds = async (guild, guildResults, roleIdToFetch) => {
  let embeds = []

  for (let k = 0; k < Object.entries(guildResults).length; k++) {
    const [roleId, resultsHash] = Object.entries(guildResults)[k];

    if (roleId !== roleIdToFetch) continue;

    embeds = embeds.concat(await getEmbedsFrom(resultsHash, roleId, guild))
  }

  return embeds
}

const getEmbedsFrom = async (resultsHash, roleId, guild) => {
  const embeds = [];

  for (let i = 0; i < Object.entries(resultsHash).length; i++) {
    const [date, voteResults] = Object.entries(resultsHash)[i];
    let radarChart = new QuickChart()
    let labels = [];
    let datasets = [{
      label: "Average Vote",
      data: []
    }];

    for (let i = 0; i < Object.entries(voteResults["results"]).length; i++) {
      const [userId, votesArray] = Object.entries(voteResults["results"])[i];
      const member = await guild.members.fetch(userId);
      const username = member.user.username;
      labels.push(username);
      datasets[0].data.push(Vote.getAverageVote(votesArray));
    }

    radarChart.setConfig({
      type: 'radar',
      data: {
        labels,
        datasets
      },
      options: {
        scale: {
          ticks: {
            min: 0,
            stepSize: 1
          }
        }
      }
    })

    const role = await guild.roles.fetch(roleId)
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${role.name} vote`)
      .setDescription(`${date}`)
      .setThumbnail('https://i.imgur.com/jPVEcj1.png')
      .addField('Vote Details', `Length: ${voteResults.periodLength} minute(s)\nParticipant Count: ${voteResults.numParticipants}`, true)
      .setImage(radarChart.getUrl())
      .setTimestamp()

    embeds.push(embed)
  }

  return embeds;
}

module.exports = {
  createGuildEmbeds,
  createUserEmbeds,
  createRoleEmbeds,
  getEmbedsFrom
}