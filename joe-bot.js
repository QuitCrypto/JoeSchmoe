const { Client, Intents, Collection, Permissions, MessageEmbed } = require("discord.js");
const RolePoll = require('./lib/RolePoll');
const Vote = require('./lib/Vote')
const fs = require('fs');
require('dotenv').config();
const getErrors = require('./utils/errors');
const QuickChart = require("quickchart-js");

const client = new Client({
                      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
                      partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
                    });


// const data = new SlashCommandBuilder()
//   .setName('ping')
//   .setDescription('Replies with Pong!')
//   .addStringOption(option => option.setName('input').setDescription('Enter a string'))
//   .addIntegerOption(option => option.setName('int').setDescription('Enter an integer'))
//   .addNumberOption(option => option.setName('num').setDescription('Enter a number'))
//   .addBooleanOption(option => option.setName('choice').setDescription('Select a boolean'))
//   .addUserOption(option => option.setName('target').setDescription('Select a user'))
//   .addChannelOption(option => option.setName('destination').setDescription('Select a channel'))
//   .addRoleOption(option => option.setName('muted').setDescription('Select a role'))
//   .addMentionableOption(option => option.setName('mentionable').setDescription('Mention something'));

client.on('messageCreate', async message => {
  
})

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

  let guild = await client.guilds.fetch("876629005879631942");
  let options;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

  try {
    switch(interaction.commandName) {
      case "enable-role-vote":
        options = {
          "roleId": interaction.options.getRole('role')?.id,
          "channelId": interaction.options.getChannel('channel')?.id,
          "frequency": interaction.options.getSubcommand(),
          "startTime": interaction.options.getInteger('start-time'),
          "periodLength": interaction.options.getInteger('period-length'),
          "day": interaction.options.getString('day'),
          "date": interaction.options.getInteger('date')
        }

        let errors = getErrors(options, "enable-role-vote");
        if (errors) {
          await interaction.reply({content: errors, ephemeral: true})
          return;
        };

        let rolePoll = new RolePoll(client, guild, options);

        rolePoll.summarize();
        await interaction.reply({content: "Your vote has been created", ephemeral: true} )
        break;
      case "history":
        options = {
          "type": interaction.options.getSubcommand(),
          "roleId": interaction.options.getRole('role')?.id,
          "user": interaction.options.getUser('user')?.id
        }
        const embeds = await getResults(options, guild);
        console.log(embeds);

        await interaction.reply({
          content: "Fetching data", 
          ephemeral: true, 
          embeds
        })

        break;
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

const getResults = async (options, guild) => {
  const allResults = JSON.parse(fs.readFileSync("./db/vote-results.json"));
  const guildResults = allResults[guild.id];
  const embeds = [];

  if (!guildResults) return;

  switch(options["type"]) {
    case "role":
      break;
    case "user":
      break;
    case "sphere":
      for (let k = 0; k < Object.entries(guildResults).length; k++) {
        const [roleId, resultsHash] = Object.entries(guildResults)[k];

        for (let i = 0; i < Object.entries(resultsHash).length; i++) {
          const [date, voteResults] = Object.entries(resultsHash)[i];
          let radarChart = new QuickChart()
          let datasets = [];
          let labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

          for (let i = 0; i < Object.entries(voteResults).length; i++) {
            const [userId, votesArray] = Object.entries(voteResults)[i];
            const member = await guild.members.fetch(userId);
            const username = member.user.username;
            const counts = {};
            votesArray.forEach(vote => counts[vote] = (counts[vote] || 0) + 1);
            // datasets.push(username, String(Vote.getAverageVote(votesArray)), true);

            datasets.push({ label: username, data: labels.map(score => counts[score] || 0) })
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

          console.log(datasets);
          const role = await guild.roles.fetch(roleId)
          const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle(`${role.name} vote`)
          .setDescription(`Vote from ${date}`)
          .setThumbnail('https://i.imgur.com/AfFp7pu.png')
          .addField('Inline field title', 'Some value here', true)
          .setImage(radarChart.getUrl())
          .setTimestamp()
          .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' })

          embeds.push(embed)
        }
      }
      return embeds;
    default:
      break;
  }
}

client.on('ready', async () => {
  console.log("Preparing the votes.");
  // let guild = await client.guilds.fetch("876629005879631942");

  // let addedZero = new Date().getUTCMinutes() > 9 ? "" : "0";

  // const options = {
  //   "roleId": "876641676695859300",
  //   "channelId": "876635387395702814",
  //   "frequency": "daily",
  //   "startTime": parseFloat(`${new Date().getUTCHours()}${addedZero}${new Date().getUTCMinutes()}`) + 1,
  //   "periodLength": 1,
  //   "day": null,
  //   "date": null,
  // }

  // let rolePoll = new RolePoll(client, guild, options);
  // rolePoll.summarize();
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot || reaction.message.author.bot || !reaction.message.guild ) return;
})

client.login(process.env.AVERAGE_BOT_TOKEN)

module.exports = client;