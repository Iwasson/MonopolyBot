const Discord = require('discord.js')//js library with commands for discord
const auth = require('./auth.json')//auth tokens for logging into bot
const client = new Discord.Client()//create a new discord client for the bot
const Canvas = require('canvas')//used to draw on images
const { createCanvas, loadImage } = require('canvas')
const Roll = require('./roll.js')

var player;//define struct
var playerList = []//hold the players for game
var pieces = ["car", "hat", "shoe", "thimble"]//Pieces available for use 
var playerTurn = 0;//whos turn is it? 0 through players.length - 1
var gameStart = false;//flag for the start of the game, allows more functions to be called once the game has started

//when the bot is initialized call the other files
client.on('ready', () => {
    console.log("Connected as " + client.user.tag)

    client.user.setActivity("Monopoly")

    var List = require('./CLL.js')

    myList = new List;
})

//Listens for commands from the user
client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { return }

    if (receivedMessage.content.startsWith(">")) {
        processCommand(receivedMessage)
    }
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) //copies the command removing the first char
    let splitCommand = fullCommand.split(" ")           //splits the command, using spaces, into a command and then args
    let primaryCommand = splitCommand[0]                //sets the primary command
    let arguments = splitCommand.slice(1)               //sets an array of arguments
    var counter = 0;
    let generalChannel = client.channels.get("664325321876832258")//Should replace with a monopoly channel 
    //Check to see what command the user entered
    if (primaryCommand == "help" || primaryCommand == "Help") {
        helpCommand(arguments, receivedMessage)
    }
    else if (primaryCommand == "Start" || primaryCommand == "start") {//Start the game... set flag to true
        if (gameStart == false){
            startCommand(arguments, receivedMessage)
            gameStart = true;
        }
        else{
            generalChannel.send("Game has already begun")//cannot call start if game has already started
        }
    }
    else if (primaryCommand == "init" || primaryCommand == "Init") {
        if (gameStart == false){//only initialize a player if the game has not started yet.
            arguments = arguments.toString();
            generalChannel.send(arguments)
            if (pieces.includes(arguments)) {
                initCommand(arguments, receivedMessage)
            }
            else {
              generalChannel.send("Error, not a valid choice. Please pick from the list below.");
              generalChannel.send(pieces);
            }
        }
        else{
            generalChannel.send("Game has already begun")
        }
    }
    else if (primaryCommand == "img" || primaryCommand == "Img") {//display the board
        if (gameStart == true){
            imgCommand(arguments, receivedMessage)
        }
        else{
            generalChannel.send("Game has not begun yet")
        }
    }
    else if (primaryCommand == "debug" || primaryCommand == "Debug") {//for use by devs, displays information
        debug(arguments, receivedMessage)
    }
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
    else if (primaryCommand == "save" || primaryCommand == "Save") {
    saveCommand(arguments, receivedMessage)
    }
    else if (primaryCommand == "display" || primaryCommand == "Display") {
        displayCommand(arguments, receivedMessage)
    }
}

function helpCommand(arguments, receivedMessage) {
    if (arguments.length == 0) {
        receivedMessage.channel.send("List of Commands: \nInit\nStart\nRoll\nSave\nLoad")
    }
    else {
        if (arguments.length == 1) {
            if (arguments[0] == "Init" || arguments[0] == "init") {
                receivedMessage.channel.send("Initializes the bot for a new game of Monopoly! Include your choice of piece Ex: >intit car ")
            }
            else if (arguments[0] == "Start" || arguments[0] == "start") {
                receivedMessage.channel.send("Starts a new game of Monopoly!")
            }
            else if (arguments[0] == "Roll" || arguments[0] == "roll") {
                receivedMessage.channel.send("Roll your two die")
            }
            else if (arguments[0] == "Save" || arguments[0] == "save") {
                receivedMessage.channel.send("Saves the current state of the game")
            }
            else if (arguments[0] == "Load" || arguments[0] == "load") {
                receivedMessage.channel.send("Loads a saved game")
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

function debug(arguments, receivedMessage) {

    let generalChannel = client.channels.get("664325321876832258");
    generalChannel.send(JSON.stringify(playerList));
    generalChannel.send(receivedMessage.author.id);
    generalChannel.send(pieces.toString());

}


async function addPlayer(arguments, receivedMessage, generalChannel){
    player = new Object();//Creates a new player to be pushed to players array
    player.playerID = receivedMessage.author.id;//player id is the id of the person who called the init command
    player.money = 1500;//starting money for each player
    player.property = null;//Start with no properties
    player.piece = arguments;//What piece did the player pick?
    player.pos = 0;
    player.number = playerList.length;
    playerList.push(player);
    if (arguments == "car") {
        pieces = pieces.filter(e => e !== "car");
    }
    else if (arguments == "hat") {
        pieces = pieces.filter(e => e !== "hat");
    }
    else if (arguments == "shoe") {
        pieces = pieces.filter(e => e !== "shoe");
    }
    else if (arguments == "thimble") {
        pieces = pieces.filter(e => e !== "thimble");
    }

    //generalChannel.send(JSON.stringify(players));
    //playerCheck.push(receivedMessage.author.id)
}

function initCommand(arguments, receivedMessage) {
    let generalChannel = client.channels.get("664325321876832258")
    const attachment = new Discord.Attachment("https://i.pinimg.com/originals/70/f5/43/70f5434216f0fb0a45c4d75d83f41b5b.jpg")
    generalChannel.send(attachment)
    var playerIn = false;
    if (playerList.length > 0) {
        if (playerList.find(({ playerID }) => playerID === receivedMessage.author.id)) {
            playerIn = true;
            generalChannel.send("Player already added")
        }
        else {
            addPlayer(arguments, receivedMessage, generalChannel)
        }
    }
    else {
        addPlayer(arguments, receivedMessage, generalChannel)
    }
}
function saveCommand(arguments, receivedMessage) {
    myList.loadDefault();
    myList.saveGame();
    let generalChannel = client.channels.get("664325321876832258");
    generalChannel.send("Saved!");
}

function displayCommand(arguments, receivedMessage) {
    let generalChannel = client.channels.get("664325321876832258");
    myList.displayAll(generalChannel);
}

//Tutorial @https://discordjs.guide/popular-topics/canvas.html#adding-in-text
async function imgCommand(arguments, receivedMessage) {
    const canvas = Canvas.createCanvas(1000, 1000);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./assets/Board.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    //used to print text.. not needed right now
    // Slightly smaller text placed above the member's display name
    //ctx.font = '28px sans-serif';
    //ctx.fillStyle = '#ffffff';
    //ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);
    //const avatar = await Canvas.loadImage("https://i0.wp.com/richonmoney.com/wordpress/wp-content/uploads/2016/06/monopoly-man.gif");
    //76.9230769 => length of each square, corners are 2x that amount so to get to square 2 it would be 76.9230769*3
    //871.1538459 is the bottom row
    //ctx.drawImage(avatar, 538.4615383, 871.1538459, 50, 50);

    const attachment = new Discord.Attachment(canvas.toBuffer(), 'https://i.dailymail.co.uk/i/pix/2011/06/03/article-1393521-0C6047E600000578-120_964x966.jpg');
    receivedMessage.reply(attachment);

}

client.login(auth.token)