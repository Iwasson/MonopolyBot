/* 
* Discord Monopoly Bot: 1/5/19 
* By Ian Wasson & John Bernards
* 
* This is intented to be a Discord Bot that allows users 
* to play a game of Monopoly. This game is in no way endorsed by 
* nor supported by Hasbro Games. It is intended as a parody game
* and for personal educational purposes only. 

Restarting work 6/1/23
*/
const { displayBoard } = require("./commands/displayCommand"); 

class Monopoly {
  constructor(
    players,      // list of all of the players in the game, should be between 2 and 4
    board         // a board state
  )

  /*
  Displays the current state of the board
  */
  async display() {
    await displayBoard(this.players);
  }

  async takeTurn(player) {

  }

  


}