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

    displayAll() {
        if (this.head == null) {
            console.log("List is empty")
            return;
        }
        else {
            this.current = this.head;
            while (this.current != this.tail) {
                console.log(this.current.element + "->");
                this.current = this.current.next;
            }
            console.log(this.current.element + "->");
        }
    }
}