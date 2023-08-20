const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
		.addStringOption(option => 
			option.setName('args')
			.setDescription('extra arguments')
		),
	async execute(interaction, game) {
		//console.log(interaction.options);
		//console.log(game);
		await interaction.reply('@' + interaction.user.globalName + ' Pong!');
	},
};
