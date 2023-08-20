const { AttachmentBuilder, Client, Events, GatewayIntentBits } = require('discord.js');
const Canvas = require('@napi-rs/canvas');

let middleLen = (1450 / 9)
let RBmiddle = (1950 - middleLen);
let boardCoords = [[RBmiddle, RBmiddle],
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

//used to get a printout of the board, it will update piece movements and house numbers.
export async function displayBoard(playerList) {
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
  const avatars = [await Canvas.loadImage("./assets/carAvatar.png"),
  await Canvas.loadImage("./assets/hatAvatar.png"),
  await Canvas.loadImage("./assets/shoeAvatar.png"),
  await Canvas.loadImage("./assets/thimbleAvatar.png")];
  for (var i = 0; i < playerList.length; ++i) {
      ctx.drawImage(avatars[playerList[i].piece], boardCoords[playerList[i].pos][0], boardCoords[playerList[i].pos][1], 50, 50);
  }
  const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'monopolyBoard.png' });
  return attachment;
}
