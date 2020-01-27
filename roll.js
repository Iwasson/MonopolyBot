const Discord = require('discord.js')
const client = new Discord.Client()

exports.rollCommand = function rollCommand(receivedMessage, counter, generalChannel) {
    //let generalChannel = client.channels.get("664325321876832258")
    var die1 = getRandomInt(1, 7)
    var die2 = getRandomInt(1, 7)

    client.on('ready', () => {
        console.log("Connected as " + client.user.tag)
    })
    var result = die1 + die2
    generalChannel.send("You Rolled: " + die1 + " and " + die2 + " for a total of: " + result)
    if (die1 == die2) {
        if (counter >= 3) {
            generalChannel.send("That is three doubles in a row... Go to jail.")
            //Put in go to jail call here
        }
        else {
            generalChannel.send("Doubles! Rolling again...");
            ++counter;
            result += rollCommand(receivedMessage, counter, generalChannel)
        }
    }
    return result;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
    //Check to see what command the user entered
    /*
    else if (primaryCommand == "roll" || primaryCommand == "Roll") {//roll function from roll.js
        //add the value of the roll to the player pos
        if(gameStart == true){
            if (receivedMessage.author.id === playerList[playerTurn].playerID){
                playerList[playerTurn].pos += Roll.rollCommand(arguments, receivedMessage, counter, generalChannel)
                if (playerList[playerTurn].pos > 39){
                    playerList[playerTurn].pos = (playerList[0].pos % 40);
                    playerList[playerTurn].money += 200;
                }
                if (playerTurn == (playerList.length - 1)){//if it is the last player reset to first player
                 playerTurn = 0;
                }
                else{
                    ++playerTurn;//move to the next player
                }
            }
            else{
                generalChannel.send("Not your turn!")
                }
        }
        else{
            generalChannel.send("Game has not begun yet")
        }
    }
    */
