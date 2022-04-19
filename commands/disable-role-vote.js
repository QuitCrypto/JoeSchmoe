const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disable-role-vote')
		.setDescription('Deletes a recurring vote for specified role.')
    .addRoleOption(option => option.setName('role').setDescription('The role vote to delete').setRequired(true))
}