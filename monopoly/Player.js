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
    number,
    moveType,
    moveTo,
    collect,
    buyable,
    payMultiplier,
    houseRepairCost,
    hotelRepairCost
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
    this.playerRoll = false;
    this.doubleCounter = 0;
    this.moveType = moveType;
    this.moveTo = moveTo;
    this.collect = collect;
    this.buyable = buyable;
    this.payMultiplier = payMultiplier;
    this.houseRepairCost = houseRepairCost;
    this.hotelRepairCost = hotelRepairCost;
  }

  ProcessCard(card) {
    switch (card.action) {
      case 'move':
        //
        switch (card.moveType) {
          case 'absolute':
            //
            this.pos = card.moveTo;
            if (card.collect) {
              this.money += card.collect;
            }
          case 'conditional':
            // Check if player passes Go
            if (this.pos > card.moveTo) {
              this.money += card.collect;
            }
            this.pos = card.moveTo;
          case 'nearest':
          // Implement logic to find nearest Utility or Railroad
          // Adjust player's position accordingly
          // Check if property is owned and take appropriate action
          case 'relative':
            //
            this.pos += card.moveBy;
        }
      case 'collect':
        //
        this.money += card.amount;
      case 'getOutCard':
        //
        this.getOutCard = true;
      case 'pay':
        //
        this.money -= card.amount;
      case 'payEachPlayer':
      // Implement logic to deduct money from each player
      case 'collectFromEachPlayer':
      // Implement logic to collect money from each player
      case 'payPerBuilding':
      // Implement logic to calculate repair costs based on player's properties
    }
  }
}
