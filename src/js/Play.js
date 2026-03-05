import {
	addDragListeners,
	isValidKey,
	getLast
} from '@jamesrock/rockjs';
import { Maze } from './Maze';
import { mazes } from './mazes';

const body = document.body;

export class Play {
	constructor() {

	  const mode = this.mode = 'extrahard';
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
    directionsArray = Object.keys(directionsKeyMap);

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

    addDragListeners(document, this.maze.size);

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
