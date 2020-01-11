class Node {
    constructor(element) {
        this.element = element;
        this.next = null;
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
                var deed = this.current.element;
                fs.appendFileSync('assets/save.txt', deed, (err) => {
                    if (err) {
                        throw (err);
                    }
                })
                this.current = this.current.next;
            }
            var deed = this.current.element;
            fs.appendFile('assets/save.txt', deed, (err) => {
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
                generalChannel.send(this.current.element)
                console.log(this.current.element);
                this.current = this.current.next;
            }
            generalChannel.send(this.current.element)
            console.log(this.current.element);
        }
    }
}

module.exports = List;

/*
myList = new List();
myList.loadDefault();
myList.saveGame();
myList.displayAll();
*/