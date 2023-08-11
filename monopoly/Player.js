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
}
