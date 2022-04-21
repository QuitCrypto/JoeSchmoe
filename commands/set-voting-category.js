const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-voting-category')
		.setDescription('Where to create the voting channels')
    .addChannelOption(option => option.setName('category').setDescription('Please choose a channel category').setRequired(true))
};