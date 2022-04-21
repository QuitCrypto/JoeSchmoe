const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('flash-vote')
		.setDescription('Starts an instant vote for a role')
    .addChannelOption(option => option.setName('category').setDescription('Please choose a channel category').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('The role to vote on').setRequired(true))
    .addIntegerOption(option => option.setName('period-length').setDescription('In minutes (Max 2440)').setRequired(true))
    .addChannelOption(option => option.setName('channel').setDescription('Where the results will post').setRequired(true))
};