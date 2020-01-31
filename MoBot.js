const Discord = require('discord.js')           //js library with commands for discord
const auth = require('./auth.json')             //auth tokens for logging into bot
const client = new Discord.Client()             //create a new discord client for the bot

const Canvas = require('canvas')                //used to draw on images
const { createCanvas, loadImage } = require('canvas')

var player;                                     //define struct
var playerList = []                             //hold the players for game
var pieces = ["car", "hat", "shoe", "thimble"]  //Pieces available for use 
var comDraw = [];
var comDiscard = [];
var chanceDraw = [];
var chanceDiscard = [];
var getOutOfJail = [];                          //stores the get out of jail free cards if drawn

var turnCounter = 0;                            //holds which players turn it currently is, goes from 0 to #players-1 
var gameStart = false;                          //flag for the start of the game, allows more functions to be called once the game has started
var playerRoll = false;                         //flag to see if the player has rolled or not. False means they have not rolled yet, true means they have rolled
var doubleCounter = 0;                          //used to see how many times you have rolled doubles
var middleLen = (1450 / 9)
var RBmiddle = (1950 - middleLen);
var boardCoords = [[RBmiddle, RBmiddle],
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
    loadCards();
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
        case 'inspect':
            if (turn(playerList, receivedMessage))
                inspectCommand();
            break;
        case 'bail':
            if (turn(playerList, receivedMessage))
                bailCommand(receivedMessage);
            break;
        case 'deeds':
            deedCommand(receivedMessage);
            break;
        case 'buy':
            if (turn(playerList, receivedMessage))
                buyCommand(arguments);
            break;
        case 'sell':
            if (turn(playerList, receivedMessage))
                sellCommand(arguments);
            break;
        case 'mortgage':
            if (turn(playerList, receivedMessage))
                mortgageCommand(arguments);
            break;
        case 'unmortgage':
            if (turn(playerList, receivedMessage))
                unmortgageCommand(arguments);
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
        case 'poke':
            pokeCommand();
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
    fs.readFile("players.json", 'utf-8', function (err, data) {
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
    player.piece = null;                          //What piece did the player pick?
    player.pos = 0;                             //stores the location of the player
    player.getOutCard = 0;                      //set to 1 if they have a get out of jail card and 2 if they have two of them
    player.jail = 0;                            //set to 3 when sent to jail, decrement by 1 each turn they dont leave
    player.number = playerList.length;
    playerList.push(player);
    if (arguments == "car") {
        player.piece = 0;
        pieces = pieces.filter(e => e !== "car");
    }
    else if (arguments == "hat") {
        player.piece = 1;
        pieces = pieces.filter(e => e !== "hat");
    }
    else if (arguments == "shoe") {
        player.piece = 2;
        pieces = pieces.filter(e => e !== "shoe");
    }
    else if (arguments == "thimble") {
        player.piece = 3;
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
        if (playerList[turnCounter].jail > 0) {
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
        if (playerList[turnCounter].jail == 1) {
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
        inspectCommand();

        //check if they have passed go, give $200
        if (playerList[turnCounter].pos > 39) {
            generalChannel.send("You have passed GO! Get $200!")
            playerList[turnCounter].pos = playerList[turnCounter].pos % 40;
            playerList[turnCounter].money += 200;
        }
        //land on community chest
        if (playerList[turnCounter].pos == 2 || playerList[turnCounter].pos == 17 || playerList[turnCounter].pos == 33) {
            drawCard(0);
        }
        //land on chance
        else if (playerList[turnCounter].pos == 7 || playerList[turnCounter].pos == 22 || playerList[turnCounter].pos == 36) {
            var check = drawCard(1);
            //if they advanced to nearest util
            if(check == 1) {
                //see if owned
                if(myList.getTitle(playerList[turnCounter].pos).owner == "null") {
                    //if unowned then notify they can buy it
                    generalChannel.send("This utility is unowned, you could buy it!");
                }
                //otherwise this tile is owned and you need to pay a specific amount
                else {
                    //util says roll 2 die, multiply by 10 then pay that to owner
                    var die3 = getRandomInt(1, 7);
                    var die4 = getRandomInt(1, 7);
                    var tempResult = die3 + die4;
                    tempResult = tempResult * 10;
                    playerList[turnCounter].money -= tempResult;
                    playerList.forEach(element => {
                        if(element.name == myList.getTitle(playerList[turnCounter].pos).owner) {
                            element.money += tempResult;
                        }
                    });
                    generalChannel.send("You roll two die and get: " + (die3 + die4) + "\nSo you have to pay " + tempResult + " to " + myList.getTitle(playerList[turnCounter].pos).owner);
                }
            }
            //check if they advanced to nearest railroad
            if(check == 2) {
                //if unowned then notify they can buy it
                if(myList.getTitle(playerList[turnCounter].pos).owner == "null") {
                    generalChannel.send("This railroad is unowned, you could buy it!");
                }
                //otherwise pay double the rent
                else {
                    var payment = myList.getTotalRent(playerList[turnCounter].pos, result);
                    playerList[turnCounter].money -= (payment * 2);
                }
            }
        }
        //income tax
        else if (playerList[turnCounter].pos == 4) {
            generalChannel.send("You've landed on income tax! Pay $200!");
            playerList[turnCounter].money -= 200;
        }
        //luxury tax
        else if (playerList[turnCounter].pos == 38) {
            generalChannel.send("You've landed on luxury tax! Pay $100!");
            playerList[turnCounter].money -= 100;
        }
        //go to jail
        else if (playerList[turnCounter].pos == 30) {
            generalChannel.send("You've landed on Go to Jail! Go straight to jail!");
            playerList[turnCounter].pos = 10;
            playerList[turnCounter].jail = 3;
        }
        //otherwise pay rent to the person who owns this tile
        else {
            var tempDeed = myList.getTitle(playerList[turnCounter].pos);
            //if someone owns this tile, pay rent
            if(tempDeed.owner != "null") {
                var totalRent = myList.getTotalRent(playerList[turnCounter].pos);
                playerList[turnCounter].money -= totalRent;
                playerList.forEach(element => {
                    if(element.name == tempDeed.owner) {
                        element.money += totalRent;
                    }
                });
                generalChannel.send("You pay " + tempDeed.owner + " $" + totalRent + " for staying at their property");
            }
        }
    }
}

//generates a random number between 1 and 7
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function inspectCommand() {
    tempTile = myList.getTitle(playerList[turnCounter].pos);
    generalChannel.send("You have $" + playerList[turnCounter].money + "\nYou are on: " + tempTile.title);

    ownable = playerList[turnCounter].pos != 40 && playerList[turnCounter].pos != 0 && playerList[turnCounter].pos != 2 && playerList[turnCounter].pos != 4 && playerList[turnCounter].pos != 7 && playerList[turnCounter].pos != 10 && playerList[turnCounter].pos != 17 && playerList[turnCounter].pos != 20 && playerList[turnCounter].pos != 22 && playerList[turnCounter].pos != 30 && playerList[turnCounter].pos != 33 && playerList[turnCounter].pos != 36 && playerList[turnCounter].pos != 38;

    //only list info for player ownable tiles
    if (tempTile.owner == "null" && ownable) {
        generalChannel.send("This plot is unowned! \nYou can buy it for: $" + tempTile.price);
    }
    else if (ownable) {
        generalChannel.send("This plot is owned by: " + tempTile.owner + "\nThere are " + tempTile.houses + " houses on this plot.");
        if (tempTile.houses > 0) {
            if (tempTile.houses == 1) {
                generalChannel.send("The rent is: $" + tempTile.rent1);
            }
            if (tempTile.houses == 2) {
                generalChannel.send("The rent is: $" + tempTile.rent2);
            }
            if (tempTile.houses == 3) {
                generalChannel.send("The rent is: $" + tempTile.rent3);
            }
            if (tempTile.houses == 4) {
                generalChannel.send("The rent is: $" + tempTile.rent4);
            }
            if (tempTile.houses == 5) {
                generalChannel.send("The rent is: $" + tempTile.rentH);
            }
        }
        else {
            generalChannel.send("The rent is: $" + tempTile.rent);
        }
    }
}

//allows a user to sell a house that they have built on a property
//must sell in order (can't sell all of the houses on one without selling all of them on another)
function sellCommand(arguments) {
    //get user input
    if (arguments.length == 0) {
        if (myList.getDeeds(playerList[turnCounter].name) == "") {
            generalChannel.send("You don't have any properties to sell houses on!");
            return;
        }
        else {
            generalChannel.send("Which property would you like to sell a house on? (ex. >sell 1) \n" + myList.getDeeds(playerList[turnCounter].name));
            return;
        }
    }
    if (!isNaN(arguments[0])) {
        var choice = parseInt(arguments[0]);
        var options = myList.getDeeds(playerList[turnCounter].name);

        if (choice > options.length) {
            generalChannel.send("Thats not a valid option.");
        }
        else {
            var property = options[choice - 1].toString().split(" ");
            var seller = myList.getDeed(property[1]);

            //check to see if there are even any houses to sell
            if (seller.houses < 0) {
                generalChannel.send("There aren't any houses on that property to sell!");
                return;
            }

            //check to see if selling one house upsets the balance
            if (myList.sellHome(deedName)) {
                playerList[turnCounter].money += (seller.priceH / 2);
                generalChannel.send("You have sold one house on " + seller.title + " for $" + (seller.priceH / 2));
                return;
            }
            else {
                generalChannel.send("You could not sell a house on " + seller.title + "\nMaybe try selling your other houses in that group first...");
                return;
            }
        }
    }
    else {
        generalChannel.send("I don't understand the request...\nTry >sell 1");
    }
}

//allows a user to buy either a deed or a house on a deed they own
function buyCommand(arguments) {
    if (arguments.length == 0) {
        generalChannel.send("What would you like to buy? (Buy deed) or (Buy house)");
        return;
    }
    tempTile = myList.getTitle(playerList[turnCounter].pos);

    if (arguments[0].toLowerCase() == "house") {
        //will need to check to see if a player owns all of the deeds in a group
        //will need to check to see if the houses are being built correctly
        //check to see if the player has any deeds
        if (myList.getDeeds(playerList[turnCounter].name) == "") {
            generalChannel.send("You don't have any properties to build houses on!");
            return;
        }
        if (arguments[0] == null) {
            generalChannel.send("Which property would you like to build a house on? (ex. >buy house 1) \n" + myList.getDeeds(playerList[turnCounter].name));
        }
        //if they send in a second argument 
        else {
            //check to see if they sent in a number
            if (!isNaN(arguments[1])) {
                var choice = parseInt(arguments[1]); //store the number in int form
                var options = myList.getDeeds(playerList[turnCounter].name); //get an array of the options that they can choose from

                //check to see if the option they provided is greater than the possible options
                if (choice > options.length) {
                    generalChannel.send("Thats not a valid option.");
                }
                //choice is valid, so see if they have all of the properties in that group
                else {
                    var property = [];
                    property = options[choice - 1].toString().split(") "); //extract the name of the deed
                    
                    //if they have the whole group, then check to see if they are trying to build without balancing
                    //cll will take care of that
                    if (myList.hasGroup(property[1], playerList[turnCounter].name)) {
                        if (myList.getTitle(playerList[turnCounter].pos).priceH > playerList[turnCounter].money) {
                            generalChannel.send("You can't afford to buy a house on that property!");
                            return;
                        }
                        else {
                            if(myList.getDeed[property[1]].houses == 5) {
                                generalChannel.send("You already have a hotel on that property, you can't buy any more houses!");
                                return;
                            }
                            if (myList.groupMortgaged(property[1]) == false) {
                                myList.buyHome(property[1]);
                                generalChannel.send("You have bought a house on " + property[1] + " for $" + myList.getTitle(playerList[turnCounter].pos).priceH);
                                return;
                            }
                            else {
                                generalChannel.send("You can't buy a house while one of your properties is mortgaged!");
                                return;
                            }
                        }
                    }
                    else {
                        generalChannel.send("You can't build a house until you own all of the deeds in that group!");
                        return;
                    }
                }
            }
            else {
                generalChannel.send("I don't understand the request...\nTry >buy house 1");
                return;
            }
        }
    }
    else if (arguments[0].toLowerCase() == "deed") {
        //check to see if they already own the tile
        if (tempTile.owner == playerList[turnCounter].name) {
            generalChannel.send("You already own this tile!");
        }
        else if (tempTile.owner != "null") {
            generalChannel.send("Someone else already owns this tile!")
        }
        else {
            if (playerList[turnCounter].money < tempTile.price) {
                generalChannel.send("You don't have enough money to buy that!");
            }
            else {
                playerList[turnCounter].money -= tempTile.price;
                myList.setOwner(playerList[turnCounter].pos, playerList[turnCounter].name);
                generalChannel.send("You have bought " + tempTile.title + " for " + tempTile.price);
            }
        }
    }
    else {
        generalChannel.send("I can't understand the request, try \"Buy Deed\" or \"Buy House\"");
    }
}

//allows you to mortgage a deed if and only if no houses are built on it,  
//or the rest of the group
function mortgageCommand(arguments) {
    //need to check three things
    //1 do they own the deed
    //2 do they have any houses in this group
    //3 is it already mortgaged

    if (arguments.length == 0) {
        if (myList.getDeeds(playerList[turnCounter].name) == "") {
            generalChannel.send("You don't have any properties to mortgage!");
            return;
        }
        else {
            generalChannel.send("What property would you like to mortgage?\n" + myList.getDeeds(playerList[turnCounter].name));
            return;
        }
    }
    else {
        if (!isNaN(arguments[0])) {
            var choice = parseInt(arguments[0]); //store the number in int form
            var options = myList.getDeeds(playerList[turnCounter].name); //get an array of the options that they can choose from

            //check to see if the option they provided is greater than the possible options
            if (choice > options.length) {
                generalChannel.send("Thats not a valid option.");
            }
            else {
                var property = options[choice - 1].toString().split(") ");

                //check to see if any houses are built on that group
                if (myList.getHouseCount(property[1]) != 0) {
                    generalChannel.send("You can't mortgage a property if it has houses on it, try selling them first!");
                    return;
                }
                //if not then mortgage the property, flip the flag and pay the user
                else {
                    playerList[turnCounter].money += parseInt(myList.getDeed(property[1]).mortgage);
                    myList.mortgage(property[1]);
                    generalChannel.send("You have mortgaged " + property[1] + " for $" + myList.getDeed(property[1]).mortgage);
                    return;
                }
            }
        }
        else {
            generalChannel.send("I don't understand the request...\nTry >mortgage 1");
            return;
        }
    }
}

//lets you pay to unmortgage a property
//unmortgage is mortgage price plus %10
function unmortgageCommand(arguments) {
    if (arguments.length == 0) {
        if (myList.getDeeds(playerList[turnCounter].name) == "") {
            generalChannel.send("You don't have any properties to unmortgage!");
            return;
        }
        else {
            generalChannel.send("What property would you like to unmortgage?\n" + myList.getMortgagedDeeds(playerList[turnCounter].name));
            return;
        }
    }
    else {
        if (!isNaN(arguments[0])) {
            var choice = parseInt(arguments[0]); //store the number in int form
            var options = myList.getDeeds(playerList[turnCounter].name); //get an array of the options that they can choose from

            //check to see if the option they provided is greater than the possible options
            if (choice > options.length) {
                generalChannel.send("Thats not a valid option.");
            }
            else {
                var property = options[choice - 1].toString().split(") ");
                var uMorPrice = parseInt(myList.getDeed(property[1]).mortgage) + parseInt(myList.getDeed(property[1]).mortgage * .1)

                if (uMorPrice > playerList[turnCounter].money) {
                    generalChannel.send("You can't afford to Unmortgage that property!");
                    return;
                }
                else {
                    playerList[turnCounter].money -= uMorPrice;
                    myList.unmortgage(property[1]);
                    generalChannel.send("You have unmortgaged that property!");
                }
            }
        }
        else {
            generalChannel.send("I don't understand the request...\nTry >unmortgage 1");
            return;
        }
    }
}

function bailCommand(receivedMessage) {
    if (playerList[turnCounter].jail > 0) {
        generalChannel.send("You have paid your bail! -$50");
        playerList[turnCounter].money -= 50;
    }
    else {
        generalChannel.send("You are not currently in jail!");
    }
}

function deedCommand(receivedMessage) {
    generalChannel.send(myList.getDeeds(receivedMessage.author.toString()));
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
async function imgCommand(arguments, ) {
    const canvas = Canvas.createCanvas(1950, 1950);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('./assets/Board.jpg');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#74037b';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    //const avatar = await Canvas.loadImage("https://i0.wp.com/richonmoney.com/wordpress/wp-content/uploads/2016/06/monopoly-man.gif");
    //76.9230769 => length of each square, corners are 2x that amount so to get to square 2 it would be 76.9230769*3
    //871.1538459 is the bottom row
    //ctx.drawImage(avatar, 538.4615383, 871.1538459, 50, 50);
    const avatars = [await Canvas.loadImage("https://bbts1.azureedge.net/images/p/full/2016/10/2bed1448-1d59-4bbc-a47d-534c35b3b040.jpg"),
    await Canvas.loadImage("https://i.ebayimg.com/images/g/8PoAAOSwt05ZqtAL/s-l300.png"),
    await Canvas.loadImage("https://i0.wp.com/richonmoney.com/wordpress/wp-content/uploads/2016/06/monopoly-man.gif"),
    await Canvas.loadImage("https://i.ebayimg.com/images/g/w8wAAOSwovNaOcjE/s-l300.png")];
    for (var i = 0; i < playerList.length; ++i) {
        ctx.drawImage(avatars[playerList[i].piece], boardCoords[playerList[i].pos][0], boardCoords[playerList[i].pos][1], 50, 50);
    }
    const attachment = new Discord.Attachment(canvas.toBuffer());
    generalChannel.send(attachment);
}

function pokeCommand() {
    generalChannel.send("Hey, " + playerList[turnCounter].name + " it is your turn...");
}

//loads the flavor text for all of the cards into the discard pile in order. 
function loadCards() {
    var fs = require('fs');
    //read community chest file
    var textByLine = fs.readFileSync('assets/CommunityChest.txt').toString().split("\n");
    textByLine.forEach(element => {
        comDiscard.push(element);
    });
    //read chance file
    textByLine = fs.readFileSync('assets/Chance.txt').toString().split("\n");
    textByLine.forEach(element => {
        chanceDiscard.push(element);
    });
}

//will reshuffle the cards from discard into the draw pile randomly
//deckNum is 0 for community and 1 for chance
function shuffleDeck(deckNum) {
    //shuffle community
    if (deckNum == 0) {
        while (comDiscard.length != 0) {
            var rpos = getRandomInt(0, comDiscard.length);
            comDraw.push(comDiscard[rpos]);
            comDiscard = comDiscard.filter(e => e !== comDiscard[rpos]);
        }
    }
    //shuffle chance
    if (deckNum == 1) {
        while (chanceDiscard.length != 0) {
            var rpos = getRandomInt(0, chanceDiscard.length);
            chanceDraw.push(chanceDiscard[rpos]);
            chanceDiscard = chanceDiscard.filter(e => e !== chanceDiscard[rpos]);
        }
    }
}

function drawCard(deckNum) {
    //used to tell if a user has drawn the advance to card
    //if 1 then they advanced to nearest util, may need to pay x10
    //if 2 then they advanced to nearest rail, may need to pay x2
    var check = 0; 
    //draw from community
    if (deckNum == 0) {
        if (comDraw.length == 0) {
            shuffleDeck(0);
        }
        //get the text and split it, card[0] has the card number
        //card[1] has the flavor text
        var card = comDraw[0].split(") ");

        switch (card[0]) {
            case '1':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 200;
                playerList[turnCounter].pos = 0;
                break;
            case '2':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 200;
                break;
            case '3':
                generalChannel.send(card[1]);
                playerList[turnCounter].money -= 50;
                break;
            case '4':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 50;
                break;
            case '5': //get out of jail free card, needs to removed from the list and saved until used
                generalChannel.send(card[1]);
                playerList[turnCounter].getOutCard += 1;
                getOutOfJail.push(comDraw[0]);
                break;
            case '6':
                generalChannel.send(card[1]);
                playerList[turnCounter].pos = 30;
                playerList[turnCounter].jail = 3;
                break;
            case '7':
                generalChannel.send(card[1]);
                playerList.forEach(element => {
                    if(element != playerList[turnCounter]) {
                        element.money -= 50;
                        playerList[turnCounter].money += 50;
                    }
                });
                break;
            case '8':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 100;
                break;
            case '9':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 20;
                break;
            case '10':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 100;
                break;
            case '11':
                generalChannel.send(card[1]);
                playerList[turnCounter].money -= 50;
                break;
            case '12':
                generalChannel.send(card[1]);
                playerList[turnCounter].money -= 50;
                break;
            case '13':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 25;
                break;
            case '14':
                generalChannel.send(card[1]); //pay $40 house and $115 per hotel
                var counts = myList.getTotalHomes(playerList[turnCounter].name);
                while(counts[0] != 0) {
                    playerList[turnCounter].money -= 40;
                    counts[0] -= 1;
                }

                while(counts[1] != 0) {
                    playerList[turnCounter].money -= 115;
                    counts[1] -= 1;
                }

                break;
            case '15':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 10;
                break;
            case '16':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 100;
                break;
        }
        //dont put the get out of jail card back onto the discard pile
        if(card[0] != '5') {
            comDiscard.push(comDraw[0]);
        }
        comDraw = comDraw.filter(e => e !== comDraw[0]);
    }
    //draw from chance
    if (deckNum == 1) {
        if (chanceDraw.length == 0) {
            shuffleDeck(1);
        }

        var card = chanceDraw[0].split(") ");

        switch (card[0]) {
            case '1':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 200;
                playerList[turnCounter].pos = 0;
                break;
            case '2':
                generalChannel.send(card[1]);
                //advance to illinois if pos is > illinois then you "advanced past go"
                if(playerList[turnCounter].pos > 24) {
                    playerList[turnCounter].money += 200;
                }
                playerList[turnCounter].pos = 24;
                break;
            case '3':
                generalChannel.send(card[1]);
                if(playerList[turnCounter].pos > 11) {
                    playerList[turnCounter].money += 200;
                }
                playerList[turnCounter].pos = 11;
                break;
            case '4':
                generalChannel.send(card[1]); //advance to nearest utility throw two die and pay 10 times that amount
                var nearUtil = myList.getNearestUtil(playerList[turnCounter].pos);
                var utilPos;
                if(nearUtil == "Electric Company") {
                    utilPos = 12;
                }
                else if(nearUtil == "Water Works") {
                    utilPos = 28;
                }
                else {
                    console.log("error: couldnt find nearest util");
                    return;
                }
                if(playerList[turnCounter].pos > utilPos) {
                    playerList[turnCounter].money += 200;
                }
                playerList[turnCounter].pos = utilPos;
                check = 1;
                break;
            case '5':
                generalChannel.send(card[1]); //advance to nearest railroad pay x2
                var nearRail = myList.getNearestRail(playerList[turnCounter].pos);
                var railPos;
                if(nearRail == "Reading Railroad") {
                    railPos = 5;
                }
                else if(nearRail == "Pennsylvania Railroad") {
                    railPos = 15;
                }
                else if(nearRail == "B & O Railroad") {
                    railPos = 25;
                }
                else if(nearRail == "Short Line") {
                    railPos = 35;
                }
                else {
                    console.log("error: couldnt find nearest rail");
                    return;
                }
                if(playerList[turnCounter].pos > railPos) {
                    playerList[turnCounter].money += 200;
                }
                playerList[turnCounter].pos = railPos;
                check = 2;
                break;
            case '6':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 50
                break;
            case '7':
                generalChannel.send(card[1]); //get out of jail card
                playerList[turnCounter].getOutCard += 1;
                getOutOfJail.push(chanceDraw[0]);
                break;
            case '8':
                generalChannel.send(card[1]);
                playerList[turnCounter].pos -= 3;
                break;
            case '9':
                generalChannel.send(card[1]); //go to jail
                playerList[turnCounter].pos = 30;
                playerList[turnCounter].jail = 3;
                break;
            case '10':
                generalChannel.send(card[1]); //pay 25 per house and 100 per hotel
                var counts = myList.getTotalHomes(playerList[turnCounter].name);
                while(counts[0] != 0) {
                    playerList[turnCounter].money -= 25;
                    counts[0] -= 1;
                }

                while(counts[1] != 0) {
                    playerList[turnCounter].money -= 100;
                    counts[1] -= 1;
                }
                break;
            case '11':
                generalChannel.send(card[1]);
                playerList[turnCounter].money -= 15;
                break;
            case '12':
                generalChannel.send(card[1]);
                if(playerList[turnCounter].pos > 5) {
                    playerList[turnCounter].money += 200;
                }
                playerList[turnCounter].pos = 5;
                break;
            case '13':
                generalChannel.send(card[1]);
                playerList[turnCounter].pos = 39;
                break;
            case '14':
                generalChannel.send(card[1]); //pay each player 50
                playerList.forEach(element => {
                    if(element != playerList[turnCounter]) {
                        element.money += 50;
                        playerList[turnCounter].money -= 50;
                    }
                });
                break;
            case '15':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 150;
                break;
            case '16':
                generalChannel.send(card[1]);
                playerList[turnCounter].money += 100;
                break;
        }

        //dont put the get out of jail free card back into the discard pile
        if(card[0] != '7') {
            chanceDiscard.push(chanceDraw[0]);
        }
        chanceDraw = chanceDraw.filter(e => e !== chanceDraw[0]);
    }
    return check;
}

//logs bot into the server
client.login(auth.token)