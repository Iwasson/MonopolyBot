const Discord = require('discord.js')
const auth = require('./auth.json')
const client = new Discord.Client()
const Canvas = require('canvas')
const {createCanvas, loadImage} = require('canvas')
const Roll = require('./roll.js')
//define struct
var player;
//hold the players for game
var players = []
var pieces = ["car", "hat", "shoe", "thimble"]
var init = false
var playerCheck = []//testing for right now to check if a player has already been added, in future check the player objects
client.on('ready', () => {
    console.log("Connected as " + client.user.tag)

    client.user.setActivity("Monopoly")
    //client.user.setAvatar("https://banner2.cleanpng.com/20180614/lsj/kisspng-rich-uncle-pennybags-monopoly-party-game-monopoly-monopoly-man-5b22af6d28f393.9150592815289997891678.jpg").catch

    /*
    client.guilds.forEach((guild) => {
        console.log(guild.name)
        guild.channels.forEach((channel) => {
            console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })
        //General Channel id: 664325321876832258
        //could also just right click on channel in discord and get id that way
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
    var result = 0;
    var counter =0;
    let generalChannel = client.channels.get("664325321876832258")
    
    if(primaryCommand == "help" || primaryCommand == "Help") {
        helpCommand(arguments, receivedMessage)
    }
    else if(primaryCommand == "Start" || primaryCommand == "start") {
        startCommand(arguments, receivedMessage)
    }
    else if(primaryCommand == "init" || primaryCommand == "Init") {
        arguments = arguments.toString();
        generalChannel.send(arguments)
        if(pieces.includes(arguments)){
            initCommand(arguments, receivedMessage)
        }
        else{
            generalChannel.send("That has alreadty been picked... try again")
        }
    }
    else if(primaryCommand == "img" || primaryCommand == "Img") {
        imgCommand(arguments, receivedMessage)
    }
    else if(primaryCommand == "roll" || primaryCommand == "Roll") {
        Roll.rollCommand(arguments, receivedMessage, result, counter, generalChannel)
    }
    else if(primaryCommand == "debug" || primaryCommand == "Debug"){
        debug(arguments, receivedMessage)
    }
}

function helpCommand(arguments, receivedMessage) {
    if(arguments.length == 0) {
        receivedMessage.channel.send("List of Commands: ")
        receivedMessage.channel.send("Init")
        receivedMessage.channel.send("Start")
        receivedMessage.channel.send("Roll")
    }
    else {
        if(arguments.length == 1) {
            if(arguments[0] == "Init" || arguments[0] == "init") {
                receivedMessage.channel.send("Initializes the bot for a new game of Monopoly! Include your choice of piece Ex: >intit car ")
            }
            else if(arguments[0] == "Start" || arguments[0] == "start") {
                receivedMessage.channel.send("Starts a new game of Monopoly!")
            }
            else if(arguments[0] == "Roll" || arguments[0] == "roll") {
                receivedMessage.channel.send("Roll your two die")
            }
            else {
                receivedMessage.channel.send("Sorry thats not a command I can help you with...")
            }
        }
        else {
            receivedMessage.channel.send("Sorry I can only help with one command at a time, please try again.")
        }
    }
}

function startCommand(arguments, receivedMessage) {
    let generalChannel = client.channels.get("664325321876832258")
    generalChannel.send("Bitch im not ready yet")
}

function debug(arguments, receivedMessage){

    let generalChannel = client.channels.get("664325321876832258");
    generalChannel.send(JSON.stringify(players));
    generalChannel.send(receivedMessage.author.id);
    generalChannel.send(pieces.toString());
    generalChannel.send(init)

}


async function addPlayer(arguments, receivedMessage, generalChannel){
    player = new Object();
    player.playerID = receivedMessage.author.id;
    player.money = 1000;
    player.property = null;
    player.piece = arguments;
    player.pos = 0;
    player.number = players.length;
    players.push(player);
    if(arguments == "car")
    {
        pieces[0] = "";
    }
    else if(arguments == "hat")
    {
        pieces[1] = "";
    }
    else if(arguments == "shoe")
    {
        pieces[2] = "";
    }
    else if(arguments == "thimble")
    {
        pieces[3] = "";
    }
    
    //generalChannel.send(JSON.stringify(players));
    //playerCheck.push(receivedMessage.author.id)
}

function initCommand(arguments, receivedMessage) {
    let generalChannel = client.channels.get("664325321876832258")
    const attachment = new Discord.Attachment("https://i.pinimg.com/originals/70/f5/43/70f5434216f0fb0a45c4d75d83f41b5b.jpg")
    generalChannel.send(attachment)
    var playerIn = false;
    init = true;
    if (players.length > 0)
    {
        if(players.find(({playerID}) => playerID === receivedMessage.author.id))
        {
            playerIn = true;
            generalChannel.send("Player already added")
        }
        else{
            addPlayer(arguments, receivedMessage, generalChannel)
        }
    }
    else {
        addPlayer(arguments, receivedMessage, generalChannel)
     }
}

/*
function rollCommand(arguments, receivedMessage, result, counter) {
    let generalChannel = client.channels.get("664325321876832258")
    var die1 = getRandomInt(1, 7)
    var die2 = getRandomInt(1, 7)

    result += die1 + die2
    generalChannel.send("You Rolled: " + die1 + " and " + die2 + " for a total of: " + result)
    if (die1 == die2){
        if(counter >=3){
            generalChannel.send("That is three doubles in a row... Go to jail.")
            //Put in go to jail call here
        }
        else{
            generalChannel.send("Doubles! Rolling again...");
            ++counter;
            rollCommand(arguments, receivedMessage, result, counter)
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
*/

//Tutorial @https://discordjs.guide/popular-topics/canvas.html#adding-in-text
async function imgCommand(arguments, receivedMessage) {
    const canvas = Canvas.createCanvas(1000, 1000);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('https://i.dailymail.co.uk/i/pix/2011/06/03/article-1393521-0C6047E600000578-120_964x966.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = '#74037b';
	ctx.strokeRect(0, 0, canvas.width, canvas.height);
    //used to print text.. not needed right now
	// Slightly smaller text placed above the member's display name
	//ctx.font = '28px sans-serif';
	//ctx.fillStyle = '#ffffff';
    //ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);
    //================================================================================
    /*
    ToDo:
        Add monopoly pieces to the board
        Function to make them move x amount of places
            Need to have pre mapped out spaces beacause of the big squares on the corners, cannot move a uniform amount
            Each player needs to be the same size.
    */
    const avatar = await Canvas.loadImage("https://i0.wp.com/richonmoney.com/wordpress/wp-content/uploads/2016/06/monopoly-man.gif");
    //76.9230769 => length of each square, corners are 2x that amount so to get to square 2 it would be 76.9230769*3
    //871.1538459 is the bottom row
	ctx.drawImage(avatar, 538.4615383, 871.1538459, 50, 50);

    const attachment = new Discord.Attachment(canvas.toBuffer(), 'https://i.dailymail.co.uk/i/pix/2011/06/03/article-1393521-0C6047E600000578-120_964x966.jpg');
    receivedMessage.reply(attachment);

}

client.login(auth.token)