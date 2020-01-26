const Discord = require('discord.js')           //js library with commands for discord
const auth = require('./auth.json')             //auth tokens for logging into bot
const client = new Discord.Client()             //create a new discord client for the bot

const Canvas = require('canvas')                //used to draw on images
const { createCanvas, loadImage } = require('canvas')
const Roll = require('./roll.js')

var player;                                     //define struct
var playerList = []                             //hold the players for game
var pieces = ["car", "hat", "shoe", "thimble"]  //Pieces available for use 
var gameStart = false;                          //flag for the start of the game, allows more functions to be called once the game has started

//when the bot is initialized call the other files
client.on('ready', () => {
    generalChannel = client.channels.get("664325321876832258"); //general channel for testing purposes WILL NEED TO NOT HARD CODE
    console.log("Connected as " + client.user.tag)
    client.user.setActivity("Monopoly")
    var List = require('./CLL.js')
    myList = new List;
})

//Listens for commands from the user
client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { return }
    if (receivedMessage.content.startsWith(">")) { processCommand(receivedMessage) }
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) //copies the command removing the first char
    let splitCommand = fullCommand.split(" ")           //splits the command, using spaces, into a command and then args
    let primaryCommand = splitCommand[0]                //sets the primary command
    primaryCommand = primaryCommand.toLowerCase();      //sets the command to lowercase
    let arguments = splitCommand.slice(1)               //sets an array of arguments

    switch (primaryCommand) {
        case 'help':
            helpCommand(arguments);
            break;
        case 'start':
            startCommand(arguments);
            break;
        case 'init':
            initCommand(arguments, receivedMessage);
            break;
        case 'img':
            imgCommand(arguments);
            break;
        case 'debug':
            debug(arguments, receivedMessage);
            break;
        case 'roll':
            rollCommand(arguments);
            break;
        case 'save':
            saveCommand(arguments);
            break;
        case 'display':
            displayCommand(arguments);
            break;
        default:
            generalChannel.send("I don't understand the request")
            break
    }
}

function helpCommand(arguments) {
    if (arguments[0] != null) { arguments[0] = arguments[0].toLowerCase(); }
    switch (arguments[0]) {
        case 'init':
            generalChannel.send("Initializes the bot for a new game of Monopoly! Include your choice of piece Ex: >intit car ");
            break;
        case 'start':
            generalChannel.send("Starts a new game of Monopoly!");
            break;
        case 'roll':
            generalChannel.send("Roll your two die");
            break;
        case 'save':
            generalChannel.send("Saves the current state of the game");
            break;
        case 'load':
            generalChannel.send("Loads a saved game");
            break;
        default:
            generalChannel.send("List of Commands: \nInit\nStart\nRoll\nSave\nLoad")
            break;
    }
}

function startCommand(arguments) {
    generalChannel.send("Im Working on it dammit")
}

function debug(arguments, receivedMessage) {
    generalChannel.send(JSON.stringify(playerList));
    generalChannel.send(receivedMessage.author.id);
    generalChannel.send(pieces.toString());

}

async function addPlayer(arguments, receivedMessage) {

    if (!pieces.includes(arguments[0])) {
        generalChannel.send("Error, not a valid choice. Please pick from the list below.");
        generalChannel.send(pieces);
        return;
    }

    player = new Object();                      //Creates a new player to be pushed to players array
    player.playerID = receivedMessage.author.id;//player id is the id of the person who called the init command
    player.money = 1500;                        //starting money for each player
    player.property = null;                     //Start with no properties
    player.piece = arguments;                   //What piece did the player pick?
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
    generalChannel.send("Player added!")
}

function initCommand(arguments, receivedMessage) {
    if(receivedMessage == null) {return}
    if (playerList.find(({ playerID }) => playerID === receivedMessage.author.id)) {
        generalChannel.send("Player already added")
    }
    else {
        addPlayer(arguments, receivedMessage)
    }

}

function saveCommand(arguments) {
    myList.loadDefault();
    myList.saveGame();
    generalChannel.send("Saved!");
}

function displayCommand(arguments) {
    myList.displayAll(generalChannel);
}

async function imgCommand(arguments) {
    const canvas = Canvas.createCanvas(1000, 1000);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./assets/Board.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    //const avatar = await Canvas.loadImage("https://i0.wp.com/richonmoney.com/wordpress/wp-content/uploads/2016/06/monopoly-man.gif");
    //76.9230769 => length of each square, corners are 2x that amount so to get to square 2 it would be 76.9230769*3
    //871.1538459 is the bottom row
    //ctx.drawImage(avatar, 538.4615383, 871.1538459, 50, 50);

    const attachment = new Discord.Attachment(canvas.toBuffer());
    generalChannel.send(attachment);

}

client.login(auth.token)