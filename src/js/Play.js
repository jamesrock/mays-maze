import {
	Rounder,
	isValidKey,
	getLast
} from '@jamesrock/rockjs';
import { Maze } from './Maze';
import { mazes } from './mazes';

const body = document.body;

export class Play {
	constructor() {

	  const mode = this.mode = 'hard';
    this.maze = new Maze(getLast(mazes[mode]), mode);

    this.maze.appendTo(body);

		this.addListeners();

		console.log(this);

	};
	addListeners() {

	  const
    directionsKeyMap = {
  		ArrowLeft: 'left',
  		ArrowUp: 'up',
  		ArrowRight: 'right',
  		ArrowDown: 'down'
    },
    directionsArray = Object.keys(directionsKeyMap),
    rounder = new Rounder(30);

    let touch = null;
    let xMovement = 0;
    let yMovement = 0;

    document.addEventListener('keydown', (e) => {

  		if(isValidKey(e.code, directionsArray)) {
   			this.maze.move(directionsKeyMap[e.key]);
  		};

  		if(this.maze.gameOver && isValidKey(e.code, ['Space'])) {
   			this.maze.reset();
  		};

    });

    document.addEventListener('click', () => {

  		if(this.maze.gameOver) {
   			this.maze.reset();
  		};

    });

    document.addEventListener('touchstart', (e) => {

      touch = e.touches[0];
      xMovement = 0;
  		yMovement = 0;

  		e.preventDefault();

    });

    document.addEventListener('touchmove', (e) => {

  		const {clientX: originalClientX, clientY: originalClientY} = touch;
  		const {clientX, clientY} = e.touches[0];
  		const x = rounder.round(clientX - originalClientX);
  		const y = rounder.round(clientY - originalClientY);

  		if(x !== xMovement) {
   			document.dispatchEvent(new Event(x > xMovement ? 'drag-right' : 'drag-left'));
  		};

  		if(y !== yMovement) {
   			document.dispatchEvent(new Event(y > yMovement ? 'drag-down' : 'drag-up'));
  		};

  		xMovement = x;
  		yMovement = y;

    });

    document.addEventListener('drag-up', () => {

  		this.maze.move('up');

    });

    document.addEventListener('drag-down', () => {

  		this.maze.move('down');

    });

    document.addEventListener('drag-right', () => {

  		this.maze.move('right');

    });

    document.addEventListener('drag-left', () => {

  		this.maze.move('left');

    });
	};
};
