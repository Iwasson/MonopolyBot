const Discord = require('discord.js')
const auth = require('./auth.json')
const client = new Discord.Client()

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)

    client.user.setActivity("Monopoly")

    /*
    client.guilds.forEach((guild) => {
        console.log(guild.name)
        guild.channels.forEach((channel) => {
            console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })
        //General Channel id: 664325321876832258
    })
    */
    
})

//Listens for commands from the user
client.on('message', (receivedMessage) => {
    if(receivedMessage.author == client.user) { return }

    if(receivedMessage.content.startsWith(">")) {
        processCommand(receivedMessage)
    }
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) //copies the command removing the first char
    let splitCommand = fullCommand.split(" ")           //splits the command, using spaces, into a command and then args
    let primaryCommand = splitCommand[0]                //sets the primary command
    let arguments = splitCommand.slice(1)               //sets an array of arguments

    if(primaryCommand == "help") {
        helpCommand(arguments, receivedMessage)
    }
    else if(primaryCommand == "init") {
        initCommand(arguments, receivedMessage)
    }
}

function helpCommand(arguments, receivedMessage) {
    if(arguments.length == 0) {
        receivedMessage.channel.send("Helping you...?")
    }
    else {
        receivedMessage.channel.send("Need help with " + arguments)
    }
}

function initCommand(arguments, receivedMessage) {
    let generalChannel = client.channels.get("664325321876832258")
    const attachment = new Discord.Attachment("https://i.pinimg.com/originals/70/f5/43/70f5434216f0fb0a45c4d75d83f41b5b.jpg")
    generalChannel.send(attachment)
}

client.login(auth.token)