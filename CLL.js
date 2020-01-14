class Node {
    constructor(element) {
        /*
        The data for each tile of the board will be loaded from a text file which will store the 
        current values for each tile. It will need to store the following data in the following order:
            Owner
            How many houses or a hotel
            Buyout Price
            Price of building a house
            Mortgage
            Rent with no house
            Rent with 1 houses
            Rent with 2 houses
            Rent with 3 houses
            Rent with 4 houses
            Rent with 1 Hotel
            Is it currently Mortgaged
            
        
        The game will then constantly update and save and pull from this list. The idea is to have a list 
        that is being updated each time a player commits to an action, and then to have the game save that data 
        at the end of their turn. This should minimize overhead and prevent data loss from bot going down or being
        restarted.
        */

        this.element = element; //stores everything temporarily
        this.next = null;       //points to next tile on the board

        var title = this.element.toString().split(":");
        var others = title[1].toString().split("/");
        
        this.title = title[0];
        this.owner = others[0];  //stores who owns the tile
        this.houses = others[1];    //if its 5 then it will count as a hotel
        this.price = others[2];  //how much the tile costs to buy
        this.priceH = others[3]; //price per house 
        this.mortgage = others[4]; //mortgage rate
        
        this.rent = others[5];   //no house rent
        this.rent1 = others[6];  //1 house rent
        this.rent2 = others[7];  //2 house rent
        this.rent3 = others[8];  //3 house rent
        this.rent4 = others[9];  //4 house rent
        this.rentH = others[10];  //hotel rent

        this.mortgaged = others[11]; //has it been mortgaged
    }
}

class List {
    //sets the list to null
    constructor() {
        this.head = null;
        this.tail = null;
    }

    append(element) {
        if (this.tail == null) {
            this.tail = new Node(element);
            this.head = this.tail;
        }
        else {
            this.tail.next = new Node(element);
            this.tail = this.tail.next;
            this.tail.next = this.head;
        }
    }

    //loads the base game with no properties and no players
    //fresh game with only base data
    loadDefault() {
        var fs = require('fs');
        var textByLine = fs.readFileSync('assets/Deeds.txt').toString().split("\n");
        textByLine.forEach(element => {
            this.append(element);
        });
    }

    //loads a saved game with all of the data needed
    loadCurrent() {

    }

    //saves the games current state
    saveGame() {
        const fs = require('fs');

        fs.writeFile('assets/save.txt', "", (err) => {
            if (err) {
                throw (err);
            }
        })


        if (this.head == null) {
            console.log("List is empty");
            return;
        }
        else {
            this.current = this.head;

            while (this.current != this.tail) {
                fs.appendFileSync('assets/save.txt', this.current.title + ":" + this.current.owner + "/" + this.current.houses + "/" + this.current.price + "/" + this.current.priceH + "/" + this.current.mortgage + "/" + this.current.rent + "/" + this.current.rent1 +"/" + this.current.rent2 + "/" + this.current.rent3 + "/" + this.current.rent4 + "/" + this.current.rentH + "/" + this.current.mortgaged, (err) => {
                    if (err) {
                        throw (err);
                    }
                })
                this.current = this.current.next;
            }

            fs.appendFile('assets/save.txt', this.current.title + ":" + this.current.owner + "/" + this.current.houses + "/" + this.current.price + "/" + this.current.priceH + "/" + this.current.mortgage + "/" + this.current.rent + "/" + this.current.rent1 +"/" + this.current.rent2 + "/" + this.current.rent3 + "/" + this.current.rent4 + "/" + this.current.rentH + "/" + this.current.mortgaged, (err) => {
                if (err) {
                    throw (err);
                }
            })
        }
    }

    displayAll(generalChannel) {
    
        if (this.head == null) {
            generalChannel.send("List is empty")
            console.log("List is empty")
            return;
        }
        else {
            this.current = this.head;
            while (this.current != this.tail) {
                generalChannel.send("Title: " + this.current.element + "\nOwner: " + this.current.owner + "\nHomes: " + this.current.houses);
                console.log("Title: " + this.current.element + "\nOwner: " + this.current.owner + "\nHomes: " + this.current.houses);
                this.current = this.current.next;
            }
            generalChannel.send(this.current.element)
            console.log(this.current.element);
        }
    }
}

module.exports = List;