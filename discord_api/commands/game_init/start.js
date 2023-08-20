const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start the Monopoly Game!'),
  async execute(interaction, players, gameStart) {
    if (players.length >= 2) {
      await interaction.reply('Starting monopoly game...');
      return true;
    } else {
      await interaction.reply('You need more friends...');
      return false;
    }
  },
};
