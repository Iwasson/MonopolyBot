import * as fs from "fs";

class Board {
    board = null;
    community_deck = null;
    community_discard = [];
    chance_deck = null;
    chance_discard = [];
    turn = playerId;
    houses = 32;
    hotels = 12;


    constructor() {
        // When the constructor is called read in the board state
        this.intializeBoard(player, player2, player3, player4);
    }

    intializeBoard(player, player2, player3, player4) {
        this.readBoardState();
        this.readCommunityChestDeck();
        this.readChanceDeck();
        this.resetBoard();
        this.shuffle(this.community_deck);
        this.shuffle(this.chance_deck);
        this.board[0].players.push(player);
        this.board[0].players.push(player2);
        this.board[0].players.push(player3);
        this.board[0].players.push(player4);
    }

    resetBoard() {
        for(i = 0; i < this.board.length; i++) {
            this.board[i].players = []
            this.board[i].owners = null;
            this.board[i].mortgaged = false;
        }
    }

    readBoardState() {
        fs.readFile("./assets/Tile.json", (error, data) => {
            // if the reading process failed,
            // throwing the error
            if (error) {
              // logging the error
              console.error(error);
              throw err;
            }
            // parsing the JSON object
            // to convert it to a JavaScript object
            this.board = JSON.parse(data);
        });
    }

    writeBoardState() {
        // converting the JSON object to a string
        const data = JSON.stringify(this.board);

        // writing the JSON string content to a file
        fs.writeFile("./assets/Tile.json", data, (error) => {
        // throwing the error
        // in case of a writing problem
        if (error) {
            // logging the error
            console.error(error);

            throw error;
        }

        console.log("Tile.json written successfully");
        });
    }

    readCommunityChestDeck() {
        fs.readFile("./assets/CommunityChest.json", (error, data) => {
            // if the reading process failed,
            // throwing the error
            if (error) {
              // logging the error
              console.error(error);
              throw err;
            }
            // parsing the JSON object
            // to convert it to a JavaScript object
            community_deck = JSON.parse(data);
            this.community_deck = community_deck.deck;
        });

    }

    readChanceDeck() {
        fs.readFile("./assets/Tile.json", (error, data) => {
            // if the reading process failed,
            // throwing the error
            if (error) {
              // logging the error
              console.error(error);
              throw err;
            }
            // parsing the JSON object
            // to convert it to a JavaScript object
            chance_deck = JSON.parse(data);
            this.chance_deck = chance_deck.deck;
        });
    }

    drawCardCommunity(player) {
        // Draw from the top of the Community Deck
        const card = this.community_deck.shift();
        // Check if the Community Deck is empty afterwards
        if(this.community_deck.length === 0) {
            // Change the discard into the Community Chest
            this.community_deck.concat(this.community_discard);
            this.community_discard = [];
            this.shuffle(this.community_deck);
        }

        return card;
    }

    drawCardChance() {
        // Draw from the top of the Chance Deck
        const card = this.chance_deck.shift();
        // Check if the Chance Deck is empty afterwards
        if(this.chance_deck.length === 0) {
            // Change the discard into the Chance Chest
            this.chance_deck.concat(this.chance_discard);
            this.chance_discard = [];
            this.shuffle(this.chance_deck);
        }
        return card;
    }

    //Algorithm from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shuffle(array) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    movePlayer(player, roll) {
        let board_size = this.board.length
        for(i = 0; i < board_size; i++) {
            if(this.board[i].players.includes(player)) {
                // If the roll puts past or at go
                if(i + roll > board_size) {
                    i = roll - (board_size - i);
                    this.board[i].players.push(player);
                }
                else {
                    this.board[i + roll].players.push(player);
                }
            }
        }
    }

    assignOwner(player, propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                this.board[i].owner = player;
            }
        }
    }

    setMortgaged(propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                this.board[i].mortgaged = true;
            }
        }
    }

    unsetMortgaged(propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                this.board[i].mortgaged = false;
            }
        }
    }

    addHouse(propertyId) {
        if(this.houses > 0) {
            for(i = 0; i < this.board.length; i++) {
                if(propertyId === this.board[i].name) {
                    this.board[i].houses += 1;
                    this.houses -= 1;
                }
            }
        }
    }

    removeHouse(propertyId, amount) {
        if(this.houses - amount >= 0) {
            for(i = 0; i < this.board.length; i++) {
                if(propertyId === this.board[i].name) {
                    this.board[i].houses -= amount;
                    this.houses += amount;
                }
            }
        }
    }

    addHotel(propertyId) {
        if(this.houses > 0) {
            for(i = 0; i < this.board.length; i++) {
                if(propertyId === this.board[i].name) {
                    this.board[i].hotels += 1;
                    this.hotels -= 1;
                }
            }
        }
    }

    removeHotel(propertyId, amount) {
        if(this.houses - amount >= 0) {
            for(i = 0; i < this.board.length; i++) {
                if(propertyId === this.board[i].name) {
                    this.board[i].hotels -= amount;
                    this.hotels += amount;
                }
            }
        }
    }

    getTilePrice(propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].price;
            }
        }
    }

    getHouses(propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].houses;
            }
        }
    }

    getHotels(propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].hotels;
            }
        }
    }

    getOwner(propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].owner;
            }
        }
    }

    getRent(propertyId) {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].rent;
            }
        }
    }

    getGroup() {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].colorGroup;
            }
        }
    }

    isMortgaged() {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].mortgaged;
            }
        }
    }

    getMortgage() {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].mortgageValue;
            }
        }
    }

    getHotelCost() {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].hotelCost;
            }
        }
    }

    getHouseCost() {
        for(i = 0; i < this.board.length; i++) {
            if(propertyId === this.board[i].name) {
                return this.board[i].houseCost;
            }
        }
    }

}