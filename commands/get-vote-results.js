const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('Retrieves voting results')
    .addSubcommand(subcommand =>
      subcommand
        .setName('sphere')
        .setDescription('Will retrieve all votes')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Will retrieve votes for user specified')
        .addUserOption(option => option.setName('user').setDescription('user to retrieve results for').setRequired(true))
    )
    .addSubcommand(subcommand => 
      subcommand
        .setName('role')
        .setDescription("Will retrieve votes for role specified")
        .addRoleOption(option => option.setName('role').setDescription('role to retrieve results for').setRequired(true))
    )
};