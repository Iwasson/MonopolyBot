const Discord = require('discord.js')           //js library with commands for discord
const auth = require('./auth.json')             //auth tokens for logging into bot
const client = new Discord.Client()             //create a new discord client for the bot

const Canvas = require('canvas')                //used to draw on images
const { createCanvas, loadImage } = require('canvas')

var player;                                     //define struct
var playerList = []                             //hold the players for game
var pieces = ["car", "hat", "shoe", "thimble"]  //Pieces available for use 

var turnCounter = 0;                            //holds which players turn it currently is, goes from 0 to #players-1 
var gameStart = false;                          //flag for the start of the game, allows more functions to be called once the game has started
var playerRoll = false;                         //flag to see if the player has rolled or not. False means they have not rolled yet, true means they have rolled
var doubleCounter = 0;                          //used to see how many times you have rolled doubles
var middleLen = (1450/9)
var RBmiddle = (1950-middleLen); 
var boardCoords = [ [RBmiddle, RBmiddle],
[1600 - (middleLen * 0), RBmiddle],
[1600 - (middleLen * 1), RBmiddle],
[1600 - (middleLen * 2), RBmiddle],
[1600 - (middleLen * 3), RBmiddle],
[1600 - (middleLen * 4), RBmiddle],
[1600 - (middleLen * 5), RBmiddle],
[1600 - (middleLen * 6), RBmiddle],
[1600 - (middleLen * 7), RBmiddle],
[1600 - (middleLen * 8), RBmiddle],
[middleLen - 50, RBmiddle],
[middleLen - 50, 1600 - (middleLen * 0)],
[middleLen - 50, 1600 - (middleLen * 1)],
[middleLen - 50, 1600 - (middleLen * 2)],
[middleLen - 50, 1600 - (middleLen * 3)],
[middleLen - 50, 1600 - (middleLen * 4)],
[middleLen - 50, 1600 - (middleLen * 5)],
[middleLen - 50, 1600 - (middleLen * 6)],
[middleLen - 50, 1600 - (middleLen * 7)],
[middleLen - 50, 1600 - (middleLen * 8)],
[middleLen - 50, middleLen - 50],
[300 + (middleLen * 0), middleLen - 50],
[300 + (middleLen * 1), middleLen - 50],
[300 + (middleLen * 2), middleLen - 50],
[300 + (middleLen * 3), middleLen - 50],
[300 + (middleLen * 4), middleLen - 50],
[300 + (middleLen * 5), middleLen - 50],
[300 + (middleLen * 6), middleLen - 50],
[300 + (middleLen * 7), middleLen - 50],
[300 + (middleLen * 8), middleLen - 50],
[RBmiddle, middleLen - 50],
[RBmiddle + 50, 300 + (middleLen * 0)],
[RBmiddle + 50, 300 + (middleLen * 1)],
[RBmiddle + 50, 300 + (middleLen * 2)],
[RBmiddle + 50, 300 + (middleLen * 3)],
[RBmiddle + 50, 300 + (middleLen * 4)],
[RBmiddle + 50, 300 + (middleLen * 5)],
[RBmiddle + 50, 300 + (middleLen * 6)],
[RBmiddle + 50, 300 + (middleLen * 7)],
[RBmiddle + 50, 300 + (middleLen * 8)],
]
//when the bot is initialized call the other files
client.on('ready', () => {
    generalChannel = client.channels.get("664325321876832258"); //general channel for testing purposes WILL NEED TO NOT HARD CODE
    console.log("Connected as " + client.user.tag)
    client.user.setActivity("Monopoly")
    var List = require('./CLL.js')
    myList = new List;
    myList.loadDefault(); //will always load the default game
})

//Listens for commands from the user
client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { return }
    if (receivedMessage.content.startsWith(">")) { processCommand(receivedMessage) }
})

//further parses the command that was given to determine which function needs to be called
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
        case 'load':
            loadSave();
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
            if (turn(playerList, receivedMessage))
                rollCommand(receivedMessage);
            break;
        case 'bail':
            if(turn(playerList, receivedMessage))
                bailCommand(receivedMessage);
            break;
        case 'reroll':
            generalChannel.send("Reseting roll");
            playerRoll = false;
            break;
        case 'save':
            saveCommand(arguments);
            break;
        case 'display':
            displayCommand(arguments);
            break;
        case 'end':
            if (turn(receivedMessage))
                endTurn();
            break;
        case 'stop':
            generalChannel.send("Force ending the game!");
            gameStart = false;
            break;
        default:
            generalChannel.send("I don't understand the request")
            break
    }
}

//prints out how to use the commands available
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

//triggers the game to start. Function behavior changes once a game has started
//the init command will cease to work, and only the players that have picked a piece 
//and joined will be listened too. No other users will be able to message the bot.
function startCommand(arguments) {
    //for testing only, shall be removed later
    if (arguments[0] == 'override') {
        generalChannel.send("As you wish, starting");
        gameStart = true;
        return;
    }
    if (playerList.length < 1) {
        generalChannel.send("There are no players! Try using >init to add yourself to the game!");
        return;
    }
    else if (playerList.length < 2) {
        generalChannel.send("It would be rather lonely playing a game of Monopoly by yourself, maybe see if anyone else wants to join you first?")
        return;
    }
    generalChannel.send("Starting!")
    gameStart = true;
}

function loadSave() {
    generalChannel.send("Loading previous save...");
    myList.loadCurrent();
    var fs = require('fs');
    fs.readFile("players.json", 'utf-8', function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            playerList = JSON.parse(data)
        }
    });
}
 
function turn(playerList, receivedMessage) {
    //check to see if it is the persons turn or not
    if (gameStart && receivedMessage && (receivedMessage.author.id != playerList[turnCounter].playerID)) {
        generalChannel.send("It is not your turn")
        return false;
    }
    else if (gameStart == false) {
        generalChannel.send("There is no game running.");
        return false;
    }
    else {
        generalChannel.send("Valid turn");
        return true;
    }
}

//prints out relevant data to developers. Will be commented out later.
function debug(arguments, receivedMessage) {
    generalChannel.send(JSON.stringify(playerList));
    generalChannel.send(receivedMessage.author.id);
    generalChannel.send(pieces.toString());
    generalChannel.send(gameStart);
    //generalChannel.send(boardCoords);
}

//adds a new player to the next game. Checks to make sure that the player has not already
//been added as well as ensures they make a vaild piece choice.
async function addPlayer(arguments, receivedMessage) {
    if (!pieces.includes(arguments[0])) {
        generalChannel.send("Error, not a valid choice. Please pick from the list below.");
        generalChannel.send(pieces);
        return;
    }

    player = new Object();                      //Creates a new player to be pushed to players array
    player.playerID = receivedMessage.author.id;//player id is the id of the person who called the init command
    player.name = receivedMessage.author.toString();
    player.money = 1500;                        //starting money for each player
    player.property = null;                     //Start with no properties
    player.piece = arguments;                   //What piece did the player pick?
    player.pos = 0;                             //stores the location of the player
    player.jail = 0;                            //set to 3 when sent to jail, decrement by 1 each turn they dont leave
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

//this command allows users to enter into a game of monopoly assuming one hasnt already been started. 
//This command will check to see if they have been added to the game already, if not then allow them to choose their piece.
function initCommand(arguments, receivedMessage) {
    if (gameStart == true) {
        generalChannel.send("A game is already in progress.");
        return;
    }

    if (receivedMessage == null) { return }
    if (playerList.find(({ playerID }) => playerID === receivedMessage.author.id)) {
        generalChannel.send("Player already added")
    }
    else {
        addPlayer(arguments, receivedMessage)
    }
}

function rollCommand(receivedMessage) {
    if (playerRoll == true) {
        generalChannel.send("You have already rolled!");
        return;
    }

    generalChannel.send("You roll the die...");

    //two die are rolled to better skew the odds of rolling some numbers
    //over others. Two die have a greater chance to roll 7 than a number generator
    //picking between 1 and 12
    var die1 = getRandomInt(1, 7);
    var die2 = getRandomInt(1, 7);
    var result = die1 + die2;

    if (die1 == die2) {
        generalChannel.send("You Rolled: " + die1 + " & " + die2 + "\nfor a total of: " + result + "\nDoubles!");
        ++doubleCounter;
        if(playerList[turnCounter].jail > 0) {
            playerList[turnCounter].jail = 0;
        }
    }
    else {
        generalChannel.send("You Rolled: " + die1 + " & " + die2 + "\nfor a total of: " + result);
        playerRoll = true;
    }
    if (doubleCounter > 2) {
        generalChannel.send("Doubles three times in a row!? Clearly you must be cheating! To jail with you!");
        playerRoll = true;
        playerList[turnCounter].pos = 10;
        playerList[turnCounter].jail = 3;
        return;
    }
    //if the player is in jail, then they need to not move and decrement counter by 1
    else if (playerList[turnCounter].jail > 0) {
        if(playerList[turnCounter].jail == 1) {
            generalChannel.send("You've been in jail for 3 turns! You must pay $50 to get out!");
            playerList[turnCounter].money -= 50;
            playerList[turnCounter].pos += result;
        }
        else {
            generalChannel.send("You sit in jail for another turn!");
            playerList[turnCounter].jail -= 1;
        }
    }
    else {
        playerList[turnCounter].pos += result;

        //check if they have passed go, give $200
        if(playerList[turnCounter].pos > 39) {
            playerList[turnCounter].pos = playerList[turnCounter].pos % 40;
            playerList[turnCounter].money += 200;
        }
        //land on community chest
        if(playerList[turnCounter].pos == 2 || playerList[turnCounter].pos == 17 || playerList[turnCounter].pos == 33) {

        }
        //land on chance
        if(playerList[turnCounter].pos == 7 || playerList[turnCounter].pos == 22 || playerList[turnCounter].pos == 36) {

        }
        //income tax
        if(playerList[turnCounter].pos == 4) {
            generalChannel.send("You've landed on income tax! Pay $200!");
            playerList[turnCounter].money -= 200;
        }
        //luxury tax
        if(playerList[turnCounter].pos == 38) {
            generalChannel.send("You've landed on luxury tax! Pay $100!");
            playerList[turnCounter].money -= 100;
        }
        //go to jail
        if(playerList[turnCounter].pos == 30) {
            generalChannel.send("You've landed on Go to Jail! Go straight to jail!");
            playerList[turnCounter].pos = 10;
            playerList[turnCounter].jail = 3;
        }
    }
}

//generates a random number between 1 and 7
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function bailCommand(receivedMessage) {
    if(playerList[turnCounter].jail > 0) {
        generalChannel.send("You have paid your bail! -$50");
        playerList[turnCounter].money -= 50;
    }
    else {
        generalChannel.send("You are not currently in jail!");
    }
}

//ends a players turn, can be tripped if sent to jail, or manually by the player to advance play
function endTurn() {
    if (playerRoll == false) {
        generalChannel.send("You haven't rolled yet!");
        return;
    }

    generalChannel.send("Ending your turn...");
    ++turnCounter;      //advance the turn counter by 1
    playerRoll = false; //resets the flag for players rolling
    doubleCounter = 0;  //resets how many doubles have been rolled.

    //should roll back to 0 after the last player has gone, should work regardless of how many players
    if (turnCounter == playerList.length) {
        turnCounter = 0;
    }

    generalChannel.send(playerList[turnCounter].name + "'s turn!");
}

//saves the current state of the game. Useful if the bot goes down, or if discord goes down
//this prevents p   layers from starting a new game each time, especially since monopoly is such a long game
function saveCommand(arguments) {
    myList.saveGame();
    myList.savePlayer(playerList);
    generalChannel.send("Saved!");
}

//for debuging purposes, will be removed later
function displayCommand(arguments) {
    myList.displayAll(generalChannel);
}

//used to get a printout of the board, it will update piece movements and house numbers.
async function imgCommand(arguments) {
    const canvas = Canvas.createCanvas(1950, 1950);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./assets/Board.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    const avatar = await Canvas.loadImage("https://i0.wp.com/richonmoney.com/wordpress/wp-content/uploads/2016/06/monopoly-man.gif");
    //76.9230769 => length of each square, corners are 2x that amount so to get to square 2 it would be 76.9230769*3
    //871.1538459 is the bottom row
    //ctx.drawImage(avatar, 538.4615383, 871.1538459, 50, 50);
    ctx.drawImage(avatar, boardCoords[0][0], boardCoords[0][1], 50, 50)

    const attachment = new Discord.Attachment(canvas.toBuffer());
    generalChannel.send(attachment);

}

//logs bot into the server
client.login(auth.token)