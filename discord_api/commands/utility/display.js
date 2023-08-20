const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('display')
		.setDescription('Shows the state of the monopoly board'),
	async execute(interaction, game) {
    await game.display();
		await interaction.reply('Pong!');
	},
};