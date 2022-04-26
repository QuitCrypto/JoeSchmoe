const { Client, Intents, Collection } = require("discord.js");
const RolePoll = require('./lib/RolePoll');
const fs = require('fs');
require('dotenv').config();
const getErrors = require('./utils/errors');
const EmbedUtils = require("./utils/embed-utils");
const JOE_VARS = JSON.parse(fs.readFileSync("./db/joe-vars.json"));
const ROLE_VOTES = JSON.parse(fs.readFileSync("./db/role-votes.json"));
const GUILD_VOTING_CATEGORY_IDS = JSON.parse(fs.readFileSync("./db/channel-category-mappings.json"));

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

  // try {
    switch(interaction.commandName) {
      case "enable-role-vote":
        if(!interaction.member.permissions.has("ADMINISTRATOR")){
          await interaction.reply({ content: "You must be an administrator to set up votes", ephemeral: true });
          break;
        }

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
          break;
        };

        ROLE_VOTES[options.roleId] = {
          guildId: guild.id, 
          options
        }
        fs.writeFileSync("db/role-votes.json", JSON.stringify(ROLE_VOTES));
        deletePreviousFor(options.roleId);


        let rolePoll = new RolePoll(client, guild, options);

        rolePoll.initialize();
        await interaction.reply({content: "Your vote has been created", ephemeral: true} )
        break;
      case "disable-role-vote":
        if(!interaction.member.permissions.has("ADMINISTRATOR")){
          await interaction.reply({ content: "You must be an administrator to manage votes", ephemeral: true });
          break;
        }

        const role = interaction.options.getRole('role');

        if (!ROLE_VOTES[role.id]) {
          await interaction.reply({ content: `There were no votes set up for ${role}!`, ephemeral: true });
          break;
        }
        delete ROLE_VOTES[role.id];

        fs.writeFileSync("db/role-votes.json", JSON.stringify(ROLE_VOTES));
        deletePreviousFor(role.id);

        await interaction.reply({ content: `Deleted vote for ${role}`, ephemeral: true });

        break;
      case "flash-vote":
        if(!interaction.member.permissions.has("ADMINISTRATOR")){
          await interaction.reply({ content: "You must be an administrator to set up votes", ephemeral: true });
          break;
        }

        await interaction.reply({ content: "This is not implemented yet!", ephemeral: true })
        // options = {
        //   roleId: interaction.options.getRole('role')?.id,
        //   channelId: interaction.options.getChannel('channel')?.id,
        //   frequency: interaction.options.getSubcommand(),
        //   startTime: interaction.options.getInteger('start-time'),
        //   periodLength: interaction.options.getInteger('period-length'),
        //   day: interaction.options.getString('day'),
        //   date: interaction.options.getInteger('date')
        // }
        // let addedZero = new Date().getUTCMinutes() > 9 ? "" : "0";

        // options = {
        //   "roleId": "876641676695859300",
        //   "channelId": "876635387395702814",
        //   "frequency": "daily",
        //   "startTime": parseFloat(`${new Date().getUTCHours()}${addedZero}${new Date().getUTCMinutes()}`) + 1,
        //   "periodLength": 1,
        //   "day": null,
        //   "date": null,
        // }
      
        // let rolePoll = new RolePoll(client, guild, options);
        // rolePoll.initialize();

        // ROLE_VOTES["flash-votes"] ||= [];
        // ROLE_VOTES.push({
        //   guildId: guild.id,
        //   options
        // })

        // fs.writeFileSync("db/role-votes.json", JSON.stringify(ROLE_VOTES));

        // let flashVote = new RolePoll(client, guild, options);

        // flashVote.initialize();
        // await interaction.reply({content: "Your vote has been created", ephemeral: true} )
        break;
      case "history":
        options = {
          type: interaction.options.getSubcommand(),
          roleId: interaction.options.getRole('role')?.id,
        }

        if (options.type === "sphere") {
          if(!interaction.member.permissions.has("ADMINISTRATOR")){
            await interaction.reply({ content: "You must be an administrator to see sphere history", ephemeral: true });
            break;
          }
        } else if (options.type === "role") {
          if (!interaction.member.roles.cache.has(options.roleId)) {
            await interaction.reply({ content: "You must have this role to see its history", ephemeral: true });
            break;
          }
        }

        const embeds = await getResults(guild, interaction, options);

        await interaction.reply({
          content: "Here's what I found:", 
          ephemeral: true, 
          embeds
        })

        break;
      case "set-voting-category":
        const category = interaction.options.getChannel("category");

        if (category.type !== "GUILD_CATEGORY") {
          interaction.reply({ content: `${category} is not a category. Please try again.`, ephemeral: true });
          break;
        } else if (!interaction.member.permissions.has("ADMINISTRATOR")) {
          await interaction.reply({ content: "You must be an administrator to set the voting channel category", ephemeral: true });
          break;
        }

        GUILD_VOTING_CATEGORY_IDS[guild.id] = category.id;
        fs.writeFileSync("db/channel-category-mappings.json", JSON.stringify(GUILD_VOTING_CATEGORY_IDS));
        await interaction.reply({ content: `Voting category set to ${category}.  New votes will appear under this category.`, ephemeral: true });
        break;
      default:
        break;
    }
  // } catch (error) {
  //   console.error(error);
  //   await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  // }
});

const deletePreviousFor = roleId => {
  RolePoll.all().forEach(rollPoll => {
    if (rollPoll.roleId === roleId) {
      RolePoll.delete(rollPoll);
    }
  });
}

const getResults = async (guild, interaction, options) => {
  const allResults = JSON.parse(fs.readFileSync("./db/vote-results.json"));
  const guildResults = allResults[guild.id];
  let embeds;

  if (!guildResults) return;

  switch(options.type) {
    case "role":
      embeds = await EmbedUtils.createRoleEmbeds(guild, guildResults, options.roleId);
      
      return embeds;
    case "self":
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

  for (let i = 0; i < Object.entries(ROLE_VOTES).length; i++) {
    const [_roleId, params] = Object.entries(ROLE_VOTES)[i];

    const guild = await client.guilds.fetch(params.guildId);

    let rolePoll = new RolePoll(client, guild, params.options);
    rolePoll.initialize(false);
  }
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
  // rolePoll.initialize();
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot || reaction.message.author.bot || !reaction.message.guild ) return;
})

client.login(process.env.AVERAGE_BOT_TOKEN)

module.exports = client;