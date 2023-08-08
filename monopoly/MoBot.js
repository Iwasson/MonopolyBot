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

const { Canvas, createCanvas, loadImage } = require('canvas'); //dont know what this does

var player; //define struct
var playerList = []; //hold the players for game
var pieces = ['car', 'hat', 'shoe', 'thimble']; //Pieces available forA use
var comDraw = []; //stores the draw pile of community chest cards
var comDiscard = []; //stores the discard pile of community chest cards
var chanceDraw = []; //stores the draw pile of chance cards
var chanceDiscard = []; //stores the discard pile of chance cards
var getOutOfJailCom = []; //stores the community get out of jail free card
var getOutOfJailChance = []; //stores the chance get out of jail free card

var tradeFlag = false; //when tripped, will trap users in a trade interface, making the trade experience much nicer
var proposeFlag = false; //when tripped will make it so that current player cannot advance their turn and player that was sent an offer must reply to trade deal
var tradeTo; //stores who the player wants to trade with
var moneyTo = 0; //stores how much money player A will give to player B
var moneyFrom = 0; //stroes how much money player B will give to player A
var deedsTo = []; //stores the deeds that player A will give to player B
var deedsFrom = []; //stores the deeds that player B will give to Player A

var turnCounter = 0; //holds which players turn it currently is, goes from 0 to #players-1
var gameStart = false; //flag for the start of the game, allows more functions to be called once the game has started
var playerRoll = false; //flag to see if the player has rolled or not. False means they have not rolled yet, true means they have rolled
var doubleCounter = 0; //used to see how many times you have rolled doubles
var middleLen = 1450 / 9;
var RBmiddle = 1950 - middleLen;
var boardCoords = [
  [RBmiddle, RBmiddle],
  [1600 - middleLen * 0, RBmiddle],
  [1600 - middleLen * 1, RBmiddle],
  [1600 - middleLen * 2, RBmiddle],
  [1600 - middleLen * 3, RBmiddle],
  [1600 - middleLen * 4, RBmiddle],
  [1600 - middleLen * 5, RBmiddle],
  [1600 - middleLen * 6, RBmiddle],
  [1600 - middleLen * 7, RBmiddle],
  [1600 - middleLen * 8, RBmiddle],
  [middleLen - 50, RBmiddle],
  [middleLen - 50, 1600 - middleLen * 0],
  [middleLen - 50, 1600 - middleLen * 1],
  [middleLen - 50, 1600 - middleLen * 2],
  [middleLen - 50, 1600 - middleLen * 3],
  [middleLen - 50, 1600 - middleLen * 4],
  [middleLen - 50, 1600 - middleLen * 5],
  [middleLen - 50, 1600 - middleLen * 6],
  [middleLen - 50, 1600 - middleLen * 7],
  [middleLen - 50, 1600 - middleLen * 8],
  [middleLen - 50, middleLen - 50],
  [300 + middleLen * 0, middleLen - 50],
  [300 + middleLen * 1, middleLen - 50],
  [300 + middleLen * 2, middleLen - 50],
  [300 + middleLen * 3, middleLen - 50],
  [300 + middleLen * 4, middleLen - 50],
  [300 + middleLen * 5, middleLen - 50],
  [300 + middleLen * 6, middleLen - 50],
  [300 + middleLen * 7, middleLen - 50],
  [300 + middleLen * 8, middleLen - 50],
  [RBmiddle, middleLen - 50],
  [RBmiddle + 50, 300 + middleLen * 0],
  [RBmiddle + 50, 300 + middleLen * 1],
  [RBmiddle + 50, 300 + middleLen * 2],
  [RBmiddle + 50, 300 + middleLen * 3],
  [RBmiddle + 50, 300 + middleLen * 4],
  [RBmiddle + 50, 300 + middleLen * 5],
  [RBmiddle + 50, 300 + middleLen * 6],
  [RBmiddle + 50, 300 + middleLen * 7],
  [RBmiddle + 50, 300 + middleLen * 8],
];

//further parses the command that was given to determine which function needs to be called
function processCommand(receivedMessage) {
  let fullCommand = receivedMessage.content.substr(1); //copies the command removing the first char
  let splitCommand = fullCommand.split(' '); //splits the command, using spaces, into a command and then args
  let primaryCommand = splitCommand[0]; //sets the primary command
  primaryCommand = primaryCommand.toLowerCase(); //sets the command to lowercase
  let arguments = splitCommand.slice(1); //sets an array of arguments

  //used to check if a user is currently attempting to trade with someone
  if (
    proposeFlag == false &&
    tradeFlag == true &&
    turn(playerList, receivedMessage)
  ) {
    switch (primaryCommand) {
      case 'help':
        generalChannel.send(
          'Type >stop to end trade mode \nType >select <username> to select which player you want to trade with\nType >inspect <username> to find out what another player has\nType >give <money/deeds/Get out of jail card> to add something to give to another player\nType >receive <money/deeds/Get out of jail card> to add something you want from another player\nType >propose to send the offer to the selected player\nType >review to see the current trade deal'
        );
        break;
      case 'stop':
        generalChannel.send('Exiting Trading mode!');
        tradeFlag = false;
        tradeTo = null;
        break;
      case 'select':
        //get all of the usernames of the people playing the game other than yourself
        if (arguments.length == 0) {
          var options = [];
          playerList.forEach((element) => {
            if (element.name != playerList[turnCounter].name) {
              options.push(element.nick + '\n');
            }
          });
          //print out the people who you can trade with
          generalChannel.send('Who would you like to trade with:\n' + options);
        } else {
          playerList.forEach((element) => {
            //check to see if the provided username is correct, also cant trade with yourself
            if (
              element.nick.toLowerCase() == arguments[0].toLowerCase() &&
              arguments[0].toLowerCase() !=
                playerList[turnCounter].nick.toLowerCase()
            ) {
              tradeTo = element;
            }
          });
          //if they provided an incorrect username
          if (tradeTo == null) {
            generalChannel.send('Thats not a valid choice...');
          }
          //otherwise let them know selection worked
          else {
            generalChannel.send('Player selected!');
          }
        }
        break;
      case 'inspect':
        if (arguments.length == 0) {
          var options = [];
          playerList.forEach((element) => {
            if (element.name != playerList[turnCounter].name) {
              options.push(element.nick + '\n');
            }
          });
          generalChannel.send('Who would you like to inspect?\n' + options);
        } else {
          playerList.forEach((element) => {
            //inspect a player and see what they have
            if (element.nick.toLowerCase() == arguments[0].toLowerCase()) {
              deedCommand(receivedMessage, element.nick.toLowerCase());
            }
          });
        }
        break;
      case 'give':
        var choice = parseInt(arguments[0]); //store the number in int form
        var optionsTo = myList.getDeeds(playerList[turnCounter].name); //get an array of the options that they can choose from
        //if no args, print out what you have to offer
        if (arguments.length == 0) {
          if (tradeTo == null) {
            generalChannel.send('Please select a player to trade with first!');
          } else {
            generalChannel.send(
              'What would you like to offer?\nMoney You have: $' +
                playerList[turnCounter].money +
                '\nDeeds:\n' +
                optionsTo
            );
          }
        }
        //else add what they want give
        else {
          if (arguments[0].toLowerCase() == 'money' && !isNaN(arguments[1])) {
            moneyTo = parseInt(arguments[1]);
            if (moneyTo < 0) {
              moneyTo = 0;
              generalChannel.send("You can't give negative money!");
            } else {
              generalChannel.send('You have added $' + moneyTo + ' to give.');
            }
          } else if (!isNaN(arguments[0])) {
            if (choice > optionsTo.length) {
              generalChannel.send('Thats not a valid option.');
            } else {
              var tempOption = optionsTo[choice - 1].toString().split(') ');
              deedsTo.push(myList.getDeed(tempOption[1]));
              generalChannel.send(
                'You have added ' + tempOption[1] + ' to give.'
              );
            }
          }
        }
        break;
      case 'receive':
        var choice = parseInt(arguments[0]); //store the number in int form
        if (arguments.length == 0) {
          if (tradeTo == null) {
            generalChannel.send('Please select a player to trade with first!');
          } else {
            var optionsFrom = myList.getDeeds(tradeTo.name);
            generalChannel.send(
              'What would you like to gain?\nMoney They have: $' +
                tradeTo.money +
                '\nDeeds:\n' +
                optionsFrom
            );
          }
        } else {
          if (arguments[0].toLowerCase() == 'money' && !isNaN(arguments[1])) {
            moneyFrom = parseInt(arguments[1]);
            if (moneyFrom < 0) {
              moneyFrom = 0;
              generalChannel.send("You can't receive negative money!");
            }
            generalChannel.send('You have added $' + moneyTo + ' to receive.');
          } else if (!isNaN(arguments[0])) {
            var optionsFrom = myList.getDeeds(tradeTo.name);
            if (choice > optionsFrom.length) {
              generalChannel.send('Thats not a valid option.');
            } else {
              var tempOption = optionsFrom[choice - 1].toString().split(') ');
              deedsFrom.push(myList.getDeed(tempOption[1]));
              generalChannel.send(
                'You have added ' + tempOption[1] + ' to receive.'
              );
            }
          }
        }
        break;
      case 'propose':
        var tempTo = [];
        deedsTo.forEach((element) => {
          tempTo.push(element.title);
        });
        var tempFrom = [];
        deedsFrom.forEach((element) => {
          tempFrom.push(element.title);
        });
        generalChannel.send('Commiting proposal to ' + tradeTo.name);
        generalChannel.send(
          'You are offering:\nMoney To: $' +
            moneyTo +
            '\nDeeds:\n' +
            tempTo +
            '\n============\nThey are giving:\nMoney From: $' +
            moneyFrom +
            '\nDeeds:\n' +
            tempFrom
        );
        proposeFlag = true;
        tradeCommand('send');
        break;
      case 'review':
        var tempTo = [];
        deedsTo.forEach((element) => {
          tempTo.push(element.title);
        });
        var tempFrom = [];
        deedsFrom.forEach((element) => {
          tempFrom.push(element.title);
        });
        generalChannel.send(
          'Current offer is: \nYou are offering:\nMoney To: $' +
            moneyTo +
            '\nDeeds:\n' +
            tempTo +
            '\n============\nThey are giving:\nMoney From: $' +
            moneyFrom +
            '\nDeeds:\n' +
            tempFrom
        );
        break;
      default:
        generalChannel.send("I don't understand the request.");
        break;
    }
  } else if (tradeFlag == true && proposeFlag == true) {
    //commands for accepting and rejecting offer
    if (receivedMessage.author.toString() == tradeTo.name) {
      switch (primaryCommand) {
        case 'accept':
          tradeCommand('accept');
          break;
        case 'reject':
          tradeCommand('reject');
          break;
      }
    } else if (turn(playerList, receivedMessage) && primaryCommand == 'abort') {
      generalChannel.send('Aborting the trade deal');
      tradeCommand('reject');
    } else {
      generalChannel.send(
        'You are not the person who needs to respond to this trade deal!'
      );
    }
  } else {
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
      /*
            case 'debug':
                debug(arguments, receivedMessage);
                break;
            */
      case 'roll':
        if (turn(playerList, receivedMessage)) rollCommand(receivedMessage);
        break;
      case 'inspect':
        if (turn(playerList, receivedMessage)) inspectCommand();
        break;
      case 'bail':
        if (turn(playerList, receivedMessage)) bailCommand(receivedMessage);
        break;
      case 'deeds':
        deedCommand(receivedMessage, null);
        break;
      case 'buy':
        if (turn(playerList, receivedMessage)) buyCommand(arguments);
        break;
      case 'sell':
        if (turn(playerList, receivedMessage)) sellCommand(arguments);
        break;
      case 'mortgage':
        if (turn(playerList, receivedMessage)) mortgageCommand(arguments);
        break;
      case 'unmortgage':
        if (turn(playerList, receivedMessage)) unmortgageCommand(arguments);
        break;
      /*
            case 'reroll':
                generalChannel.send("Reseting roll");
                playerRoll = false;
                break;
            */
      case 'save':
        saveCommand(arguments);
        break;
      /* for debugging only
            case 'display':
                displayCommand(arguments);
                break;
            */
      case 'end':
        if (turn(receivedMessage)) endTurn();
        break;
      case 'trade':
        generalChannel.send('Entering Trade mode!');
        tradeFlag = true;
        break;
      case 'stop':
        generalChannel.send('Force ending the game!');
        gameStart = false;
        break;
      case 'poke':
        pokeCommand();
        break;
      default:
        generalChannel.send("I don't understand the request");
        break;
    }
  }
}

//triggers the game to start. Function behavior changes once a game has started
//the init command will cease to work, and only the players that have picked a piece
//and joined will be listened too. No other users will be able to message the bot.
function startCommand(arguments) {
  //for testing only, shall be removed later
  if (arguments[0] == 'override') {
    generalChannel.send('As you wish, starting');
    gameStart = true;
    return;
  }
  if (gameStart == true) {
    generalChannel.send('A game is already in progress');
    return;
  }
  if (playerList.length < 1) {
    generalChannel.send(
      'There are no players! Try using >init to add yourself to the game!'
    );
    return;
  } else if (playerList.length < 2) {
    generalChannel.send(
      'It would be rather lonely playing a game of Monopoly by yourself, maybe see if anyone else wants to join you first?'
    );
    return;
  }
  generalChannel.send('Starting!');
  gameStart = true;
}

function loadSave() {
  generalChannel.send('Loading previous save...');
  myList.loadCurrent();
  var fs = require('fs');
  fs.readFile('players.json', 'utf-8', function (err, data) {
    if (err) {
      console.log(err);
    } else {
      playerList = JSON.parse(data);
    }
  });
}

function turn(playerList, receivedMessage) {
  //check to see if it is the persons turn or not
  if (
    gameStart &&
    receivedMessage &&
    receivedMessage.author.id != playerList[turnCounter].playerID
  ) {
    generalChannel.send('It is not your turn');
    return false;
  } else if (gameStart == false) {
    generalChannel.send('There is no game running.');
    return false;
  } else {
    generalChannel.send('Valid turn');
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
    generalChannel.send(
      'Error, not a valid choice. Please pick from the list below.'
    );
    generalChannel.send(pieces);
    return;
  }

  player = new Object(); //Creates a new player to be pushed to players array
  player.playerID = receivedMessage.author.id; //player id is the id of the person who called the init command
  player.name = receivedMessage.author.toString();

  var tempString = receivedMessage.member.user.tag.split('#');
  player.nick = tempString[0];
  player.money = 1500; //starting money for each player
  player.property = null; //Start with no properties
  player.piece = null; //What piece did the player pick?
  player.pos = 0; //stores the location of the player
  player.getOutCard = 0; //set to 1 if they have a get out of jail card and 2 if they have two of them
  player.jail = 0; //set to 3 when sent to jail, decrement by 1 each turn they dont leave
  player.number = playerList.length;

  playerList.push(player);
  if (arguments == 'car') {
    player.piece = 0;
    pieces = pieces.filter((e) => e !== 'car');
  } else if (arguments == 'hat') {
    player.piece = 1;
    pieces = pieces.filter((e) => e !== 'hat');
  } else if (arguments == 'shoe') {
    player.piece = 2;
    pieces = pieces.filter((e) => e !== 'shoe');
  } else if (arguments == 'thimble') {
    player.piece = 3;
    pieces = pieces.filter((e) => e !== 'thimble');
  }
  generalChannel.send('Player added!');
}

//this command allows users to enter into a game of monopoly assuming one hasnt already been started.
//This command will check to see if they have been added to the game already, if not then allow them to choose their piece.
function initCommand(arguments, receivedMessage) {
  if (gameStart == true) {
    generalChannel.send('A game is already in progress.');
    return;
  }

  if (receivedMessage == null) {
    return;
  }
  if (
    playerList.find(({ playerID }) => playerID === receivedMessage.author.id)
  ) {
    generalChannel.send('Player already added');
  } else {
    addPlayer(arguments, receivedMessage);
  }
}

//saves the current state of the game. Useful if the bot goes down, or if discord goes down
//this prevents p   layers from starting a new game each time, especially since monopoly is such a long game
function saveCommand(arguments) {
  myList.saveGame();
  myList.savePlayer(playerList);
  generalChannel.send('Saved!');
}

//for debuging purposes, will be removed later
function displayCommand(arguments) {
  myList.displayAll(generalChannel);
}

//used to get a printout of the board, it will update piece movements and house numbers.
async function imgCommand(arguments) {
  const canvas = Canvas.createCanvas(1950, 1950);
  const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage('./assets/Monopoly_Board.png');
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#74037b';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  //const avatar = await Canvas.loadImage("https://i0.wp.com/richonmoney.com/wordpress/wp-content/uploads/2016/06/monopoly-man.gif");
  //76.9230769 => length of each square, corners are 2x that amount so to get to square 2 it would be 76.9230769*3
  //871.1538459 is the bottom row
  //ctx.drawImage(avatar, 538.4615383, 871.1538459, 50, 50);
  const avatars = [
    await Canvas.loadImage('./assets/carAvatar.png'),
    await Canvas.loadImage('./assets/hatAvatar.png'),
    await Canvas.loadImage('./assets/shoeAvatar.png'),
    await Canvas.loadImage('./assets/thimbleAvatar.png'),
  ];
  for (var i = 0; i < playerList.length; ++i) {
    ctx.drawImage(
      avatars[playerList[i].piece],
      boardCoords[playerList[i].pos][0],
      boardCoords[playerList[i].pos][1],
      50,
      50
    );
  }
  const attachment = new Discord.Attachment(canvas.toBuffer());
  generalChannel.send(attachment);
}

//loads the flavor text for all of the cards into the discard pile in order.
function loadCards() {
  var fs = require('fs');
  //read community chest file
  var textByLine = fs
    .readFileSync('assets/CommunityChest.txt')
    .toString()
    .split('\n');
  textByLine.forEach((element) => {
    comDiscard.push(element);
  });
  //read chance file
  textByLine = fs.readFileSync('assets/Chance.txt').toString().split('\n');
  textByLine.forEach((element) => {
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
      comDiscard = comDiscard.filter((e) => e !== comDiscard[rpos]);
    }
  }
  //shuffle chance
  if (deckNum == 1) {
    while (chanceDiscard.length != 0) {
      var rpos = getRandomInt(0, chanceDiscard.length);
      chanceDraw.push(chanceDiscard[rpos]);
      chanceDiscard = chanceDiscard.filter((e) => e !== chanceDiscard[rpos]);
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
    var card = comDraw[0].split(') ');

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
        getOutOfJailCom.push(comDraw[0]);
        break;
      case '6':
        generalChannel.send(card[1]);
        playerList[turnCounter].pos = 30;
        playerList[turnCounter].jail = 3;
        break;
      case '7':
        generalChannel.send(card[1]);
        playerList.forEach((element) => {
          if (element != playerList[turnCounter]) {
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
        while (counts[0] != 0) {
          playerList[turnCounter].money -= 40;
          counts[0] -= 1;
        }

        while (counts[1] != 0) {
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
    if (card[0] != '5') {
      comDiscard.push(comDraw[0]);
    }
    comDraw = comDraw.filter((e) => e !== comDraw[0]);
  }
  //draw from chance
  if (deckNum == 1) {
    if (chanceDraw.length == 0) {
      shuffleDeck(1);
    }

    var card = chanceDraw[0].split(') ');

    switch (card[0]) {
      case '1':
        generalChannel.send(card[1]);
        playerList[turnCounter].money += 200;
        playerList[turnCounter].pos = 0;
        break;
      case '2':
        generalChannel.send(card[1]);
        //advance to illinois if pos is > illinois then you "advanced past go"
        if (playerList[turnCounter].pos > 24) {
          playerList[turnCounter].money += 200;
        }
        playerList[turnCounter].pos = 24;
        break;
      case '3':
        generalChannel.send(card[1]);
        if (playerList[turnCounter].pos > 11) {
          playerList[turnCounter].money += 200;
        }
        playerList[turnCounter].pos = 11;
        break;
      case '4':
        generalChannel.send(card[1]); //advance to nearest utility throw two die and pay 10 times that amount
        var nearUtil = myList.getNearestUtil(playerList[turnCounter].pos);
        var utilPos;
        if (nearUtil == 'Electric Company') {
          utilPos = 12;
        } else if (nearUtil == 'Water Works') {
          utilPos = 28;
        } else {
          console.log('error: couldnt find nearest util');
          return;
        }
        if (playerList[turnCounter].pos > utilPos) {
          playerList[turnCounter].money += 200;
        }
        playerList[turnCounter].pos = utilPos;
        check = 1;
        break;
      case '5':
        generalChannel.send(card[1]); //advance to nearest railroad pay x2
        var nearRail = myList.getNearestRail(playerList[turnCounter].pos);
        var railPos;
        if (nearRail == 'Reading Railroad') {
          railPos = 5;
        } else if (nearRail == 'Pennsylvania Railroad') {
          railPos = 15;
        } else if (nearRail == 'B & O Railroad') {
          railPos = 25;
        } else if (nearRail == 'Short Line') {
          railPos = 35;
        } else {
          console.log('error: couldnt find nearest rail');
          return;
        }
        if (playerList[turnCounter].pos > railPos) {
          playerList[turnCounter].money += 200;
        }
        playerList[turnCounter].pos = railPos;
        check = 2;
        break;
      case '6':
        generalChannel.send(card[1]);
        playerList[turnCounter].money += 50;
        break;
      case '7':
        generalChannel.send(card[1]); //get out of jail card
        playerList[turnCounter].getOutCard += 1;
        getOutOfJailChance.push(chanceDraw[0]);
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
        while (counts[0] != 0) {
          playerList[turnCounter].money -= 25;
          counts[0] -= 1;
        }

        while (counts[1] != 0) {
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
        if (playerList[turnCounter].pos > 5) {
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
        playerList.forEach((element) => {
          if (element != playerList[turnCounter]) {
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
    if (card[0] != '7') {
      chanceDiscard.push(chanceDraw[0]);
    }
    chanceDraw = chanceDraw.filter((e) => e !== chanceDraw[0]);
  }
  return check;
}

//allows a player to trade money and properties back and forth
//can only be initiated by current turn player
//function commits changes or reverts changes
function tradeCommand(option) {
  if (option == 'send') {
    var tempTo = [];
    var tempFrom = [];
    deedsTo.forEach((element) => {
      tempTo.push(element.title);
    });
    deedsFrom.forEach((element) => {
      tempFrom.push(element.title);
    });
    generalChannel.send(
      tradeTo.name +
        ' you have a trade offer from ' +
        playerList[turnCounter].name +
        '\n(player who sent the deal can type >abort to cancel the deal)'
    );
    generalChannel.send(
      'They would like to give you: \nMoney: $' +
        moneyTo +
        '\nDeeds: ' +
        tempTo +
        '\n============\nThey want from you: \nMoney: $' +
        moneyFrom +
        '\nDeeds: ' +
        tempFrom +
        '\n\nWould you like to accept (>accept) this offer or reject (>reject) this offer?'
    );
    return;
  }
  //distribute all of the right stuff to the right players
  else if (option == 'accept') {
    generalChannel.send('You have accepted the deal!');
    //give any money offered
    playerList[turnCounter] -= moneyTo;
    playerList[turnCounter] += moneyFrom;

    //assign the new owners of the properties
    deedsTo.forEach((element) => {
      element.owner = tradeTo.name;
    });

    deedsFrom.forEach((element) => {
      element.owner = playerList[turnCounter].name;
    });
  }
  //if they rejected the trade deal, then notify
  else if (option == 'reject') {
    generalChannel.send('You have rejected the deal!');
  }
  //regardless of decision, reset all flags and temp objects
  tradeFlag = false;
  proposeFlag = false;

  moneyTo = 0;
  moneyFrom = 0;

  deedsTo = null;
  deedsFrom = null;
}

function bankrupt() {
  if (playerList[turnCounter].money < 0) {
    if (myList.getDeeds(playerList[turnCounter]).length <= 0) {
      return -1;
    } else {
      generalChannel.send(
        'You do not have enough money to end the round, try selling some properties or houses.'
      );
      return 1;
    }
  }
  return 0;
}
