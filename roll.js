const Discord = require('discord.js')
const client = new Discord.Client()

exports.rollCommand = function rollCommand(arguments, receivedMessage, counter, generalChannel) {
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
            result += rollCommand(arguments, receivedMessage, counter, generalChannel)
        }
    }
    return result;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
