const { SlashCommandBuilder } = require('@discordjs/builders');
const DAYS = [['Monday', 'M'], ['Tuesday', 'T'], ['Wednesday', 'W'], ['Thursday', 'R'], ['Friday', 'F'], ['Saturday', 'S'], ['Sunday', 'U']]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enable-role-vote')
		.setDescription('Sets up a recurring vote for specified role. This will overwrite any previous role votes')
    .addSubcommand(subcommand =>
      subcommand
        .setName('daily')
        .setDescription('Votes will happen daily')
        .addRoleOption(option => option.setName('role').setDescription('The role to vote on').setRequired(true))
        .addIntegerOption(option => option.setName('start-time').setDescription('0-2400 (in UTC)').setRequired(true))
        .addIntegerOption(option => option.setName('period-length').setDescription('In minutes (Max 1380)').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Where the results will post').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('weekly')
        .setDescription('Votes will happen weekly')
        .addStringOption(option => option.setName('day').setDescription(`The day votes will occur`).setRequired(true).addChoices(DAYS))
        .addRoleOption(option => option.setName('role').setDescription('The role to vote on').setRequired(true))
        .addIntegerOption(option => option.setName('start-time').setDescription('0-2400 (in UTC)').setRequired(true))
        .addIntegerOption(option => option.setName('period-length').setDescription('In minutes (Max 2440)').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Where the results will post').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('monthly')
        .setDescription('Votes will happen monthly')
        .addIntegerOption(option => option.setName('date').setDescription('1-28').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('The role to vote on').setRequired(true))
        .addIntegerOption(option => option.setName('start-time').setDescription('0-2400 (in UTC)').setRequired(true))
        .addIntegerOption(option => option.setName('period-length').setDescription('In minutes (Max 2440)').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Where the results will post').setRequired(true))),
};