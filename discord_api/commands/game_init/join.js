const { SlashCommandBuilder } = require('discord.js');
const Player = require("../../../monopoly/Player.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join Monopoly Game!')
    .addStringOption((option) =>
      option
        .setName('piece')
        .setDescription('Choose your monopoly piece:')
        .setRequired(true)
    ),
  async execute(interaction, players, availablePieces) {
    let chosenPiece = interaction.options.getString('piece');

    if (availablePieces.includes(chosenPiece)) {
      let newPlayer = new Player(
        interaction.user.id,
        interaction.user.globalName,
        chosenPiece
      );
      players.push(newPlayer);
      // Now remove the piece from the available list
      let index = availablePieces.indexOf(chosenPiece);
      availablePieces.splice(index, 1);
      await interaction.reply(
        `${interaction.user.globalName} has joined as the ${chosenPiece}`
      );
    } else {
      let replyString = `
That piece is not available.\n
Here are the available pieces:\n
${availablePieces.join("\n")}
            `;
      await interaction.reply(replyString);
    }
  },
};
