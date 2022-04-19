const { Client, Intents, Collection } = require("discord.js");
const RolePoll = require('./lib/RolePoll');
const fs = require('fs');
require('dotenv').config();
const getErrors = require('./utils/errors');
const EmbedUtils = require("./utils/embed-utils");
const JOE_VARS = require("./db/joe-vars.json")

const client = new Client({
                      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
                      partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
                    });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

  let guild = await client.guilds.fetch(interaction.guildId);
  let options;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

  try {
    switch(interaction.commandName) {
      case "enable-role-vote":
        options = {
          roleId: interaction.options.getRole('role')?.id,
          channelId: interaction.options.getChannel('channel')?.id,
          frequency: interaction.options.getSubcommand(),
          startTime: interaction.options.getInteger('start-time'),
          periodLength: interaction.options.getInteger('period-length'),
          day: interaction.options.getString('day'),
          date: interaction.options.getInteger('date')
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
          type: interaction.options.getSubcommand(),
          roleId: interaction.options.getRole('role')?.id,
        }

        if (options.type === "sphere") {
          if(!message.member.hasPermission("ADMINISTRATOR")){
            await interaction.reply({ content: "You must be an administrator to see sphere history", ephemeral: true });
            return
          }
        } else if (options.type === "role") {
          if (!interaction.member.roles.cache.has(roleId)) {
            await interaction.reply({ content: "You must have this role to see its history", ephemeral: true });
            return
          }
        }

        const embeds = await getResults(guild, interaction, options);

        await interaction.reply({
          content: "Here's what I found:", 
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

const getResults = async (guild, interaction, options) => {
  const allResults = JSON.parse(fs.readFileSync("./db/vote-results.json"));
  const guildResults = allResults[guild.id];
  let embeds;

  if (!guildResults) return;

  switch(options.type) {
    case "role":
      embeds = await EmbedUtils.createRoleEmbeds(guild, guildResults, options.roleId);
      
      return embeds;
      case "user":
      embeds = await EmbedUtils.createUserEmbeds(guild, guildResults, interaction.user.id);
      
      return embeds;
    case "sphere":
      embeds = await EmbedUtils.createGuildEmbeds(guild, guildResults);
      
      return embeds;
    default:
      break;
  }
}

client.on('ready', async () => {
  console.log("Preparing the votes.");
  let guilds = await (await client.guilds.fetch()).map(guild => guild.id);
  JOE_VARS["guildIds"] = guilds;
  fs.writeFileSync("./db/joe-vars.json", JSON.stringify(JOE_VARS))

  // for testing:

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