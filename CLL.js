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
            Group it belongs too (Blue group, Green Group etc...)
            
        
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
        this.group = others[12]; //which housing group does it belong too
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
        var fs = require('fs');
        var textByLine = fs.readFileSync('assets/save.txt').toString().split("\n");
        textByLine.forEach(element => {
            this.append(element);
        });
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
                fs.appendFileSync('assets/save.txt', this.current.title + ":" + this.current.owner + "/" + this.current.houses + "/" + this.current.price + "/" + this.current.priceH + "/" + this.current.mortgage + "/" + this.current.rent + "/" + this.current.rent1 + "/" + this.current.rent2 + "/" + this.current.rent3 + "/" + this.current.rent4 + "/" + this.current.rentH + "/" + this.current.mortgaged + "/" + this.current.group, (err) => {
                    if (err) {
                        throw (err);
                    }
                })
                this.current = this.current.next;
            }

            fs.appendFile('assets/save.txt', this.current.title + ":" + this.current.owner + "/" + this.current.houses + "/" + this.current.price + "/" + this.current.priceH + "/" + this.current.mortgage + "/" + this.current.rent + "/" + this.current.rent1 + "/" + this.current.rent2 + "/" + this.current.rent3 + "/" + this.current.rent4 + "/" + this.current.rentH + "/" + this.current.mortgaged + "/" + this.current.group, (err) => {
                if (err) {
                    throw (err);
                }
            })
        }
    }

    //returns a list of all of the properties that a player owns
    getDeeds(player) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        var deeds = "";
        var count = 0;
        this.current = this.head;

        do {
            if (this.current.owner == player) {
                count += 1;
                deeds += count.toString();
                deeds += ") ";
                deeds += this.current.title;
                deeds += "\n";
            }
            this.current = this.current.next;
        } while (this.current != this.head);
        return deeds;
    }

    //returns the group number for a given deed
    getGroup(deedName) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        this.current = this.head;

        do {
            if (this.current.title == deedName) {
                return this.current.group;
            }
            this.current = this.current.next;
        } while (this.current != this.head);
    }

    //parses the list, finds the deed with the proper name, gets the group number and looks 
    //to see if the player owns all of them
    hasGroup(deedName, player) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        this.current = this.head;
        var groupId = getGroup(deedName);

        if (groupId == "null") {
            return false;
        }

        var owned = 0;

        //now parse a second time to see if they own all of that group
        //current should already be set to head
        do {
            //if the tile is part of the group
            if (this.current.group == groupId) {
                //if the player owns it, then increment owned, if owned is 2 for the two groups 1 and 8 or 3 for the others, then they can buy houses
                if (this.current.owner == player) {
                    owned += 1;
                }
            }
            this.current = this.current.next;
        } while (this.current != this.head);

        if ((groupId == 1 || groupId == 8) && (owned == 2)) {
            return true;
        }
        else if (owned == 3) {
            return true;
        }
        else {
            return false;
        }
    }

    sellHome(deedName) {
        var groupId = getGroup(deedName);
        var groupDeeds;
        var choice;
        var count = 0;
        var h1;
        var h2;
        var h3;

        do {
            if (this.current.group == groupId) {
                groupDeeds += this.current;
            }
            if (this.current.title == deedName) {
                choice = count;
            }
            count += 1;
            this.current = this.current.next;
        } while (this.current != this.head);
        //check to see if the homes are on the groups that have only two deeds
        if (groupId == 1 || groupId == 8) {
            if (choice == 0) {
                h1 = groupDeeds[0];
                h2 = groupDeeds[1];
            }
            else {
                h1 = groupDeeds[1];
                h2 = groupDeeds[0];
            }

            //if the two deeds have equal number of houses, or if selling one would put it at greater than
            //or equal to the other, sell it
            if (h1.houses == h2.houses || (h1.houses - 1 >= h2.houses)) {
                this.setHouseCount(deedName, -1);
                return true;
            }
        }
        else {
            if (choice == 0) {
                h1 = groupDeeds[0];
                h2 = groupDeeds[1];
                h3 = groupDeeds[2];
            }
            if (choice == 1) {
                h1 = groupDeeds[1];
                h2 = groupDeeds[2];
                h3 = groupDeeds[0];
            }
            if (choice == 2) {
                h1 = groupDeeds[2];
                h2 = groupDeeds[0];
                h3 = groupDeeds[1];
            }

            if (h1.houses == h2.houses && h1.houses == h3.houses) {
                setHouseCount(deedName, -1);
                return true;
            }
            else if ((h1.houses - 1 >= h2.houses) && (h1.houses - 1 >= h3.houses)) {
                setHouseCount(deedName, -1);
                return true;
            }
            else {
                return false;
            }
        }
    }

    //attempts to buy a house, assume hasGroup has already been called
    //will not check to see if one person owns all of the deeds in a group 
    buyHome(deedName) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        //check all of the deeds in a group, if the deed that they are trying to build
        //a house on would put it at 2 more houses than another, reject the request.
        var groupDeeds;
        var count = 0;
        var h1 = 0; //deed player wants to buy a house on
        var h2 = 0;
        var h3 = 0;
        var choice;
        var groupId = getGroup(deedName);
        this.current = this.head;

        if (groupId == "null" || groupId > 8) {
            console.log("Attempted to buy a non ownable space");
            generalChannel.send("You can't build a house on that!");
            return false;
        }

        do {
            if (this.current.group == groupId) {
                groupDeeds += this.current;
            }
            if (this.current.title == deedName) {
                choice = count;
            }
            count += 1;
            this.current = this.current.next;
        } while (this.current != this.head);

        //we now have an array of all of the deeds in a group
        //check if placing one house on the desired deed will 
        //make the request invalid

        //need to check two different cases
        //these are the two groups that have only two deeds
        if (groupId == 1 || groupId == 8) {
            //check to see if placing 1 house will upset the balance
            if (choice == 0) {
                h1 = groupDeeds[0];
                h2 = groupDeeds[1];
            }
            else {
                h1 = groupDeeds[1];
                h2 = groupDeeds[0];
            }

            //you can buy if they have the same number of houses or if the choice has less than the other
            if (h1.houses == h2.houses || h1.houses < h2.houses) {
                setHouseCount(deedName, 1);
                return true;
            }
            else {
                return false;
            }
        }
        //all other deeds that you can buy houses on
        else {
            //can only build if each of the deeds has the same number of houses
            //or if the deed has less than the deed with the most houses on it
            //ex. deed 1 has 0 houses deed 2 has 1 house deed 3 has 1 house 
            //      you can build on deed 1 but not the other two
            if (choice == 0) {
                h1 = groupDeeds[0];
                h2 = groupDeeds[1];
                h3 = groupDeeds[2];
            }
            if (choice == 1) {
                h1 = groupDeeds[1];
                h2 = groupDeeds[2];
                h3 = groupDeeds[0];
            }
            if (choice == 2) {
                h1 = groupDeeds[2];
                h2 = groupDeeds[0];
                h3 = groupDeeds[1];
            }

            //if they all have equal amounts of houses on them, buy a home
            if (h1.houses == h2.houses && h1.houses == h3.houses) {
                setHouseCount(deedName, 1);
                return true;
            }
            else if ((h1.houses + 1 <= h2.houses) && (h1.houses + 1 <= h3.houses)) {
                setHouseCount(deedName, 1);
                return true;
            }

        }
    }

    //returns a list of all of the deeds a player has mortgaged
    getMortgagedDeeds(player) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        this.current = this.head;
        var deeds = "";
        var count = 0;

        do {
            if (this.current.owner == player && this.current.mortgaged == true) {
                count += 1;
                deeds += count.toString();
                deeds += ") ";
                deeds += this.current.title;
                deeds += "\n";
            }
            this.current = this.current.next;
        } while (this.current != this.head);
        return deeds;
    }

    groupMortgaged(deedName) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        var groupId = getGroup(deedName);
        this.current = this.head;

        do {
            if(this.current.group == groupId) {
                if(this.current.mortgaged == true) {
                    return true;
                }
            }
        } while(this.current != this.head);

        return false;
    }

    //mortgages a property
    mortgage(deedName) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        this.current = this.head;

        do {
            if (this.current.title == deedName) {
                this.current.mortgaged = true;
                return;
            }
            this.current = this.current.next;
        } while (this.current != this.head);
    }

    //unmortgages a property
    unmortgage(deedName) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        this.current = this.head;

        do {
            if (this.current.title = deedName) {
                this.current.mortgaged = false;
                return;
            }
            this.current = this.current.next;
        } while (this.current != this.head);
    }

    //builds one house on a specific deed
    setHouseCount(deedName, counts) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        this.current = this.head;

        do {
            if (this.current.title == deedName) {
                this.current.houses += count;
                return;
            }
            this.current = this.current.next;
        } while (this.current != this.head);
    }

    savePlayer(players) {
        var fs = require('fs');
        var jsonData = JSON.stringify(players);
        fs.writeFile("players.json", jsonData, function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    //returns how many houses are built in a group
    getHouseCount(deedName) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        var groupId = getGroup(deedName);
        var count = 0;
        this.current = this.head;

        do {
            if (this.current.group == groupId) {
                count += this.current.houses;
            }
            this.current = this.current.next;
        } while (this.current != this.head);

        return count;
    }

    getTitle(pos) {
        if (this.head == null) {
            console.log("List is empty")
            return;
        }
        this.current = this.head

        while (pos > 0) {
            this.current = this.current.next;
            pos -= 1;
        }
        return this.current;
    }

    getDeed(deedName) {
        if (this.head == null) {
            console.log("List is empty")
            return;
        }

        this.current = this.head;

        do {
            if (this.current.title == deedName) {
                return this.current;
            }
            this.current = this.current.next;
        } while (this.current != this.head);
    }

    setOwner(pos, player) {
        if (this.head == null) {
            console.log("List is empty");
            return;
        }

        this.current = this.head;

        while (pos > 0) {
            this.current = this.current.next;
            pos -= 1;
        }
        this.current.owner = player;
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
                generalChannel.send("Title: " + this.current.title + "\tOwner: " + this.current.owner + "\tHomes: " + this.current.houses);
                console.log("Title: " + this.current.title + "\tOwner: " + this.current.owner + "\tHomes: " + this.current.houses);
                this.current = this.current.next;
            }
            generalChannel.send("Title: " + this.current.title + "\tOwner: " + this.current.owner + "\tHomes: " + this.current.houses);
            console.log("Title: " + this.current.title + "\tOwner: " + this.current.owner + "\tHomes: " + this.current.houses);
        }
    }
}

module.exports = List;