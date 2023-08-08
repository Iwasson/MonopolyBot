class Player {
  constructor(
    playerID,
    name,
    nick,
    money,
    property,
    piece,
    pos,
    getOutCard,
    jail,
    number
  ) {
    this.playerID = playerID;
    this.name = name;
    this.nick = nick;
    this.money = money;
    this.property = property;
    this.piece = piece;
    this.pos = pos;
    this.getOutCard = getOutCard;
    this.jail = jail;
    this.number = number;
    this.playerRoll = false; // TODO - Does this need to stored within the class?
    this.doubleCounter = 0; // TODO - Does this need to stored within the class?
  }

  poke() {
    console.log('Hey, ' + this.name + ' it is your turn...');
  }

  // Takes in the prompts from the user as the argument
  // Needed to rename since in a class we are in js' strict mode
  help(prompts) {
    if (prompts[0] != null) {
      prompts[0] = prompts[0].toLowerCase();
    }
    switch (prompts[0]) {
      case 'bail':
        return 'Buy your way out of jail... you filthy animal ;)';
      case 'init':
        return 'Initializes the bot for a new game of Monopoly! Include your choice of piece Ex: >intit car ';
      case 'start':
        return 'Starts a new game of Monopoly!';
      case 'roll':
        return 'Roll your two die';
      case 'save':
        return 'Saves the current state of the game';
      case 'load':
        return 'Loads a saved game';
      default:
        return 'List of Commands: \nBail\tBuy\nDebug\tDeeds\nTrade\tEnd\nHelp\tImg\nInit\tInspect\nLoad\tMortgage\nPoke\tReroll\nRoll\tSave\nSell\tStart\nStop\tUnmortgage';
    }
  }

  inspect() {
    console.log(
      'You have $' + this.money + '\nYou are on: ' + this.property.title
    );
  }

  roll(receivedMessage) {
    if (this.playerRoll == true) {
      return 'You have already rolled!';
    }

    var response = 'You roll the die...\n';

    //two die are rolled to better skew the odds of rolling some numbers
    //over others. Two die have a greater chance to roll 7 than a number generator
    //picking between 1 and 12
    var die1 = getRandomInt(1, 7);
    var die2 = getRandomInt(1, 7);
    var result = die1 + die2;

    if (die1 == die2) {
      response +=
        'You Rolled: ' +
        die1 +
        ' & ' +
        die2 +
        '\nfor a total of: ' +
        result +
        '\nDoubles!\n';
      this.doubleCounter = this.doubleCounter + 1;
      if (this.jail > 0) {
        this.jail = 0;
      }
    } else {
      response +=
        'You Rolled: ' +
        die1 +
        ' & ' +
        die2 +
        '\nfor a total of: ' +
        result +
        '\n';
      this.playerRoll = true;
    }
    if (this.doubleCounter > 2) {
      response +=
        'Doubles three times in a row!? Clearly you must be cheating! To jail with you!\n';
      this.playerRoll = true;
      this.pos = 10;
      this.jail = 3;
      return;
    }
    //if the player is in jail, then they need to not move and decrement counter by 1
    else if (this.jail > 0) {
      if (this.jail == 1) {
        response +=
          "You've been in jail for 3 turns! You must pay $50 to get out!\n";
        this.money -= 50;
        this.pos += result;
      } else {
        response += 'You sit in jail for another turn!\n';
        this.jail -= 1;
      }
    } else {
      this.pos += result;
      inspectCommand();

      //check if they have passed go, give $200
      if (this.pos > 39) {
        response += 'You have passed GO! Get $200!\n';
        this.pos = this.pos % 40;
        this.money += 200;
      }
      //land on community chest
      if (this.pos == 2 || this.pos == 17 || this.pos == 33) {
        drawCard(0);
      }
      //land on chance
      else if (this.pos == 7 || this.pos == 22 || this.pos == 36) {
        var check = drawCard(1);
        //if they advanced to nearest util
        if (check == 1) {
          //see if owned
          if (myList.getTitle(this.pos).owner == 'null') {
            //if unowned then notify they can buy it
            response += 'This utility is unowned, you could buy it!\n';
          }
          //otherwise this tile is owned and you need to pay a specific amount
          else {
            //util says roll 2 die, multiply by 10 then pay that to owner
            var die3 = getRandomInt(1, 7);
            var die4 = getRandomInt(1, 7);
            var tempResult = die3 + die4;
            tempResult = tempResult * 10;
            this.money -= tempResult;
            playerList.forEach((element) => {
              if (element.name == myList.getTitle(this.pos).owner) {
                element.money += tempResult;
              }
            });
            response +=
              'You roll two die and get: ' +
              (die3 + die4) +
              '\nSo you have to pay ' +
              tempResult +
              ' to ' +
              myList.getTitle(this.pos).owner;
          }
        }
        //check if they advanced to nearest railroad
        if (check == 2) {
          //if unowned then notify they can buy it
          if (myList.getTitle(this.pos).owner == 'null') {
            response += 'This railroad is unowned, you could buy it!\n';
          }
          //otherwise pay double the rent
          else {
            var payment = myList.getTotalRent(this.pos, result);
            this.money -= payment * 2;
          }
        }
      }
      //income tax
      else if (this.pos == 4) {
        response += "You've landed on income tax! Pay $200!\n";
        this.money -= 200;
      }
      //luxury tax
      else if (this.pos == 38) {
        response += "You've landed on luxury tax! Pay $100!\n";
        this.money -= 100;
      }
      //go to jail
      else if (this.pos == 30) {
        response += "You've landed on Go to Jail! Go straight to jail!\n";
        this.pos = 10;
        this.jail = 3;
        this.playerRoll = true;
      }
      //otherwise pay rent to the person who owns this tile
      else {
        var tempDeed = myList.getTitle(this.pos);
        //if someone owns this tile, pay rent
        if (tempDeed.owner != 'null') {
          var totalRent = myList.getTotalRent(this.pos);
          this.money -= totalRent;
          playerList.forEach((element) => {
            if (element.name == tempDeed.owner) {
              element.money += totalRent;
            }
          });
          response +=
            'You pay ' +
            tempDeed.owner +
            ' $' +
            totalRent +
            ' for staying at their property\n';
        }
      }
    }
    return response;
  }

  //generates a random number between 1 and 7
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  inspectCommand() {
    tempTile = myList.getTitle(this.pos);
    var response =
      'You have $' + this.money + '\nYou are on: ' + tempTile.title + '\n';

    ownable =
      this.pos != 40 &&
      this.pos != 0 &&
      this.pos != 2 &&
      this.pos != 4 &&
      this.pos != 7 &&
      this.pos != 10 &&
      this.pos != 17 &&
      this.pos != 20 &&
      this.pos != 22 &&
      this.pos != 30 &&
      this.pos != 33 &&
      this.pos != 36 &&
      this.pos != 38;

    //only list info for player ownable tiles
    if (tempTile.owner == 'null' && ownable) {
      response +=
        'This plot is unowned! \nYou can buy it for: $' + tempTile.price + '\n';
    } else if (ownable && tempTile.mortgaged == false) {
      response +=
        'This plot is owned by: ' +
        tempTile.owner +
        '\nThere are ' +
        tempTile.houses +
        ' houses on this plot.';
      if (tempTile.houses > 0) {
        if (tempTile.houses == 1) {
          response += 'The rent is: $' + tempTile.rent1;
        }
        if (tempTile.houses == 2) {
          response += 'The rent is: $' + tempTile.rent2;
        }
        if (tempTile.houses == 3) {
          response += 'The rent is: $' + tempTile.rent3;
        }
        if (tempTile.houses == 4) {
          response += 'The rent is: $' + tempTile.rent4;
        }
        if (tempTile.houses == 5) {
          response += 'The rent is: $' + tempTile.rentH;
        }
      } else {
        response += 'The rent is: $' + tempTile.rent;
      }
    } else if (tempTile.mortgaged == true) {
      response += 'This tile is mortgaged!';
    }
    return response;
  }

  //allows a user to sell a house that they have built on a property
  //must sell in order (can't sell all of the houses on one without selling all of them on another)
  sellCommand(prompts) {
    //get user input
    if (prompts.length == 0) {
      if (myList.getDeeds(this.name) == '') {
        return "You don't have any properties to sell houses on!";
      } else {
        return (
          'Which property would you like to sell a house on? (ex. >sell 1) \n' +
          myList.getDeeds(this.name)
        );
      }
    }
    if (!isNaN(prompts[0])) {
      var choice = parseInt(prompts[0]);
      var options = myList.getDeeds(this.name);

      if (choice > options.length) {
        return 'Thats not a valid option.';
      } else {
        var property = options[choice - 1].toString().split(' ');
        var seller = myList.getDeed(property[1]);

        //check to see if there are even any houses to sell
        if (seller.houses < 0) {
          return "There aren't any houses on that property to sell!";
        }

        //check to see if selling one house upsets the balance
        if (myList.sellHome(deedName)) {
          this.money += seller.priceH / 2;
          return (
            'You have sold one house on ' +
            seller.title +
            ' for $' +
            seller.priceH / 2
          );
        } else {
          return (
            'You could not sell a house on ' +
            seller.title +
            '\nMaybe try selling your other houses in that group first...'
          );
        }
      }
    }
    return "I don't understand the request...\nTry >sell 1";
  }

  //allows a user to buy either a deed or a house on a deed they own
  buyCommand(prompts) {
    if (prompts.length == 0) {
      return 'What would you like to buy? (Buy deed) or (Buy house)';
    }
    tempTile = myList.getTitle(this.pos);

    if (prompts[0].toLowerCase() == 'house') {
      //will need to check to see if a player owns all of the deeds in a group
      //will need to check to see if the houses are being built correctly
      //check to see if the player has any deeds
      if (myList.getDeeds(this.name) == '') {
        return "You don't have any properties to build houses on!";
      }
      if (prompts[0] == null) {
        return (
          'Which property would you like to build a house on? (ex. >buy house 1) \n' +
          myList.getDeeds(this.name)
        );
      }
      //if they send in a second argument
      else {
        //check to see if they sent in a number
        if (!isNaN(prompts[1])) {
          var choice = parseInt(prompts[1]); //store the number in int form
          var options = myList.getDeeds(this.name); //get an array of the options that they can choose from

          //check to see if the option they provided is greater than the possible options
          if (choice > options.length) {
            return 'Thats not a valid option.';
          }
          //choice is valid, so see if they have all of the properties in that group
          else {
            var property = [];
            property = options[choice - 1].toString().split(') '); //extract the name of the deed

            //if they have the whole group, then check to see if they are trying to build without balancing
            //cll will take care of that
            if (myList.hasGroup(property[1], this.name)) {
              if (myList.getTitle(this.pos).priceH > this.money) {
                return "You can't afford to buy a house on that property!";
                return;
              } else {
                if (myList.getDeed[property[1]].houses == 5) {
                  return "You already have a hotel on that property, you can't buy any more houses!";
                }
                if (myList.groupMortgaged(property[1]) == false) {
                  myList.buyHome(property[1]);
                  return (
                    'You have bought a house on ' +
                    property[1] +
                    ' for $' +
                    myList.getTitle(this.pos).priceH
                  );
                } else {
                  return "You can't buy a house while one of your properties is mortgaged!";
                }
              }
            } else {
              return "You can't build a house until you own all of the deeds in that group!";
            }
          }
        } else {
          return "I don't understand the request...\nTry >buy house 1";
        }
      }
    } else if (prompts[0].toLowerCase() == 'deed') {
      //check to see if they already own the tile
      if (tempTile.owner == this.name) {
        return 'You already own this tile!';
      } else if (tempTile.owner != 'null') {
        return 'Someone else already owns this tile!';
      } else {
        if (this.money < tempTile.price) {
          return "You don't have enough money to buy that!";
        } else {
          this.money -= tempTile.price;
          myList.setOwner(this.pos, this.name);
          return 'You have bought ' + tempTile.title + ' for ' + tempTile.price;
        }
      }
    }
    return 'I can\'t understand the request, try "Buy Deed" or "Buy House"';
  }

  //allows you to mortgage a deed if and only if no houses are built on it,
  //or the rest of the group
  mortgageCommand(prompts) {
    //need to check three things
    //1 do they own the deed
    //2 do they have any houses in this group
    //3 is it already mortgaged

    if (prompts.length == 0) {
      if (myList.getDeeds(this.name) == '') {
        return "You don't have any properties to mortgage!";
      } else {
        return (
          'What property would you like to mortgage?\n' +
          myList.getDeeds(this.name)
        );
      }
    } else {
      if (!isNaN(prompts[0])) {
        var choice = parseInt(prompts[0]); //store the number in int form
        var options = myList.getDeeds(this.name); //get an array of the options that they can choose from

        //check to see if the option they provided is greater than the possible options
        if (choice > options.length) {
          return 'Thats not a valid option.';
        } else {
          var property = options[choice - 1].toString().split(') ');

          //check to see if any houses are built on that group
          if (myList.getHouseCount(property[1]) != 0) {
            return "You can't mortgage a property if it has houses on it, try selling them first!";
          }
          //if not then mortgage the property, flip the flag and pay the user
          else {
            this.money += parseInt(myList.getDeed(property[1]).mortgage);
            myList.mortgage(property[1]);
            return (
              'You have mortgaged ' +
              property[1] +
              ' for $' +
              myList.getDeed(property[1]).mortgage
            );
          }
        }
      }
    }
    return "I don't understand the request...\nTry >mortgage 1";
  }

  //lets you pay to unmortgage a property
  //unmortgage is mortgage price plus %10
  unmortgageCommand(prompts) {
    if (prompts.length == 0) {
      if (myList.getDeeds(this.name) == '') {
        return "You don't have any properties to unmortgage!";
      } else {
        return (
          'What property would you like to unmortgage?\n' +
          myList.getMortgagedDeeds(this.name)
        );
      }
    } else {
      if (!isNaN(prompts[0])) {
        var choice = parseInt(prompts[0]); //store the number in int form
        var options = myList.getDeeds(this.name); //get an array of the options that they can choose from

        //check to see if the option they provided is greater than the possible options
        if (choice > options.length) {
          return 'Thats not a valid option.';
        } else {
          var property = options[choice - 1].toString().split(') ');
          var uMorPrice =
            parseInt(myList.getDeed(property[1]).mortgage) +
            parseInt(myList.getDeed(property[1]).mortgage * 0.1);

          if (uMorPrice > this.money) {
            return "You can't afford to Unmortgage that property!";
          } else {
            this.money -= uMorPrice;
            myList.unmortgage(property[1]);
            return 'You have unmortgaged that property!';
          }
        }
      } else {
        return "I don't understand the request...\nTry >unmortgage 1";
      }
    }
  }

  bailCommand(receivedMessage) {
    if (this.jail > 0 && this.getOutCard == 0) {
      this.money -= 50;
      return 'You have paid your bail! -$50';
    }
    //see if they have a card from community chest
    else if (this.jail > 0 && this.getOutCard == 1) {
      comDiscard.push(getOutOfJailCom[0]);
      getOutOfJailCom = null;
      this.getOutCard = 0;
      return 'Using your Get out of Jail Free Card!';
    }
    //see if they have a card from chance
    else if (this.jail > 0 && this.getOutCard == 2) {
      chanceDiscard.push(getOutOfJailChance[0]);
      getOutOfJailChance = null;
      this.getOutCard = 0;
      return 'Using your Get out of Jail Free Card!';
    }
    //see if they have a card from both, if  so put community back first
    else if (this.jail > 0 && this.getOutCard == 3) {
      comDiscard.push(getOutOfJailCom[0]);
      getOutOfJailCom = null;
      this.getOutCard = 2;
      return 'Using your Get out of Jail Free Card!';
    }
    return 'You are not currently in jail!';
  }

  deedCommand(receivedMessage, player) {
    if (player == null) {
      var tempDeeds = myList.getDeeds(receivedMessage.author.toString());
      if (tempDeeds == null) {
        return 'You have no deeds!';
      } else {
        return tempDeeds;
      }
    } else if (player != null) {
      var tempDeeds;
      playerList.forEach((element) => {
        if (element.nick.toLowerCase() == player.toLowerCase()) {
          tempDeeds = myList.getDeeds(element.name);
        }
      });
      if (tempDeeds == null) {
        return 'They have no deeds!';
      } else {
        return tempDeeds;
      }
    }
    return 'Not a valid Request...';
  }

  //ends a players turn, can be tripped if sent to jail, or manually by the player to advance play
  endTurn() {
    if (this.playerRoll == false) {
      return "You haven't rolled yet!";
    }
    var con = bankrupt();
    if (con == -1) {
      if (playerList.length < 2) {
        return 'Congrats ' + this.name + '! You are the winner of Monopoly';
        //end le game
      } else {
        if (turnCounter == playerList.length - 1) {
          playerList = playerList.filter((e) => e !== this);
          ++turnCounter; //advance the turn counter by 1
          this.playerRoll = false; //resets the flag for players rolling
          this.doubleCounter = 0; //resets how many doubles have been rolled.

          //should roll back to 0 after the last player has gone, should work regardless of how many players
          if (turnCounter >= playerList.length) {
            turnCounter = 0;
          }

          return "Ending your turn... It's now " + this.name + "'s turn!";
        } else {
          playerList = playerList.filter((e) => e !== this);
          this.playerRoll = false; //resets the flag for players rolling
          this.doubleCounter = 0; //resets how many doubles have been rolled.

          //should roll back to 0 after the last player has gone, should work regardless of how many players
          if (turnCounter == playerList.length) {
            turnCounter = 0;
          }

          return "Ending your turn... It's now " + this.name + "'s turn!";
        }
      }
    }
    if (con == 0) {
      ++turnCounter; //advance the turn counter by 1
      this.playerRoll = false; //resets the flag for players rolling
      this.doubleCounter = 0; //resets how many doubles have been rolled.

      //should roll back to 0 after the last player has gone, should work regardless of how many players
      if (turnCounter == playerList.length) {
        turnCounter = 0;
      }

      return "Ending your turn... It's now " + this.name + "'s turn!";
    }
    if (con == 1) {
      return 'You do not have enough money to end your turn, try selling something first!';
    }
    return 'Not a valid Request...';
  }
}

module.exports = Player;
