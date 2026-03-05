import {
	Scaler,
	GameBase,
	setDocumentHeight,
	makeArray,
	minWidth,
	makeNode,
	floorTo
} from '@jamesrock/rockjs';
import { SoundManager } from './SoundManager';
import { mapToGrid } from './utils';
import { settings } from './Maker';

setDocumentHeight();

const scaler = new Scaler(2);

const makeCoins = (w, h) => {
  let x = 4;
  let y = 1;
  const limit = ((w-1)/3);
  const rows = ((h-1)/3);
  return makeArray((limit*rows)-1).map((index) => {

    const coin = new Coin(x, y);

    if(x > 0 && x%(w-3) === 0) {
      x = 1;
      y += 3;
    }
    else {
      x += 3;
    };

    return coin;

  });
};

const getPixelSize = () => {
  return minWidth(50*10) ? 50 : 30;
};

class Wall {
	constructor(x, y, color = 'deeppink') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Coin {
	constructor(x, y, color = 'white') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Man {
	constructor(x, y, color = 'white') {

		this.x = x;
		this.y = y;
		this.color = color;

	};
};

class Door {
	constructor(x, y, color = 'deeppink') {

		this.x = x;
		this.y = y;
		this.color = color;
		this.open = false;

	};
};

export class Maze extends GameBase {
	constructor(data, mode = 'easy') {

		super('maze');

		this.mode = mode;
		this.props = settings[this.mode];

		this.width = this.props.width;
		this.height = this.props.height;
		this.size = scaler.inflate(getPixelSize());
		this.data = data;
		this.grid = mapToGrid(data, this.width);
		this.walls = this.grid.filter(([type]) => type===1).map(([type, x, y]) => new Wall(x, y));
		this.doors = this.grid.filter(([type]) => type===2).map(([type, x, y]) => new Door(x, y));
		this.coins = makeCoins(this.width, this.height);
		this.sounds = new SoundManager({
		  'point': '/audio/point.mp3'
		});
		this.countCount = this.coins.length;

		this.canvas.width = scaler.inflate(window.innerWidth);
		this.canvas.height = scaler.inflate(window.innerHeight);
		this.canvas.style.width = `${scaler.deflate(this.canvas.width)}px`;

		this.node.appendChild(this.canvas);
		this.node.appendChild(this.gameOverNode);

		this.showGameOverScreen();
		this.reset();
		this.render();

		console.log(this);

	};
	render() {

		// this.canvas.width = this.inflate(this.width);
		this.canvas.width = scaler.inflate(window.innerWidth);

		// this.ctx.fillStyle = '#222';
		// this.ctx.fillRect(this.inflate(this.x), this.inflate(this.y), this.inflate(this.width), this.inflate(this.height));

		this.walls.forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(this.inflate(x + this.x), this.inflate(y + this.y), this.size, this.size);
		});

		this.doors.filter((door) => !door.open).forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(this.inflate(x + this.x), this.inflate(y + this.y), this.size, this.size);
		});

		this.coins.forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.beginPath();
      this.ctx.arc(this.inflate((x + 1) + this.x), this.inflate((y + 1) + this.y), this.size*0.6, 0, 2 * Math.PI);
      this.ctx.fill();
		});

		this.men.forEach(({x, y, color}) => {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(this.inflate(x), this.inflate(y), this.size*2, this.size*2);
		});

		// this.animationFrame = requestAnimationFrame(() => {
		// 	this.render();
		// });

		return this;

	};
	reset() {

		const onePixel = scaler.deflate(this.size);
		const numberOfXPixels = floorTo(window.innerWidth / onePixel);
		const numberOfYPixels = floorTo(window.innerHeight / onePixel);

		this.x = floorTo((numberOfXPixels / 2) - 2);
		this.y = floorTo((numberOfYPixels / 2) - 4);

		this.men = [new Man(this.x + 1, this.y + 1)];
		this.score = 0;
		this.gameOver = false;

		this.gameOverNode.dataset.active = false;

		return this;

	};
	checkCoins() {

		const coin = this.coins.find(({x, y}) => (x + this.x) === (this.men[0].x) && (y + this.y) === (this.men[0].y));

		if(coin) {

			this.coins.splice(this.coins.indexOf(coin), 1);
			this.score ++;

			this.sounds.play('point');

			if(this.coins.length === 0) {
			  this.doors.forEach((door) => {
					door.open = true;
				});
			};

		};

		return false;

	};
	move(direction) {

	  if(!this.canMove(direction)) {
			return;
		};

		switch(direction) {
      case 'up':
        this.y += 3;
      break;
      case 'down':
        this.y -= 3;
      break;
      case 'left':
        this.x += 3;
      break;
      case 'right':
        this.x -= 3;
      break;
		};

		this.checkCoins();
		this.render();

		return this;

	};
	canMove(direction) {

    let {x, y} = this.men[0];

    switch(direction) {
      case 'up':
        y --;
      break;
      case 'down':
        y ++;
      break;
      case 'left':
        x --;
      break;
      case 'right':
        x ++;
      break;
		};

		const queries = [
     	`x${x}y${y}`, // top left
     	`x${x+1}y${y}`, // top right
     	`x${x}y${y+1}`, // bottom right
     	`x${x+1}y${y+1}`, // bottom left
    ];

    return !queries.map((q) => this.checkForWall(q)).includes(true) && !queries.map((q) => this.checkForDoor(q)).includes(true);

	};
	inflate(a) {

		return (a * this.size);

	};
	checkForWall(q) {

		return this.walls.map((wall) => (`x${wall.x+this.x}y${wall.y+this.y}`)).includes(q);

	};
	checkForDoor(q) {

		return this.doors.filter((door) => !door.open).map((door) => (`x${door.x+this.x}y${door.y+this.y}`)).includes(q);

	};
	stop() {

		cancelAnimationFrame(this.animationFrame);
		return this;

	};
};
