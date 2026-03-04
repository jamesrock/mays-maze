import {
  DisplayObject,
  Rounder,
	isValidKey,
	makeArray,
	makeInput,
	makeNode,
	makeButton,
	makeSelect
} from '@jamesrock/rockjs';
import { mapToGrid } from './utils';
import { mazes } from './mazes';

export const settings = {
  'easy': {
    xPos: 3,
    yPos: 38,
    size: 1476,
    pixelSize: 20,
    width: 37,
    height: 49
  },
  'medium': {
    xPos: 3,
    yPos: 37,
    size: 1406,
    pixelSize: 15,
    width: 46,
    height: 61
  },
  'hard': {
    xPos: 4,
    yPos: 36,
    size: 1370,
    pixelSize: 12,
    width: 55,
    height: 73
  },
  'extrahard': {
    xPos: 4,
    yPos: 37,
    size: 1398,
    pixelSize: 10,
    width: 67,
    height: 88
  },
};

const body = document.body;

const makeOpacitySlider = () => {
  const node = makeInput(0, 'range');
  node.min = 0;
  node.max = 1;
  node.step = 0.1;
  node.value = 1;
  return node;
};

const makeSweeper = (size) => {

  const pixel = makeNode('div', 'grid-sweeper');
  pixel.dataset.x = 1;
  pixel.dataset.y = 1;
  pixel.classList.add('sweeper');
  pixel.style.width = pixel.style.height = `${(size*2)+1}px`;
  pixel.style.position = 'absolute';
  pixel.style.left = `${1*size+2}px`;
  pixel.style.top = `${1*size+2}px`;
  return pixel;

};

const getGuides = (w, h) => {

  let x = 0;
  let y = 0;

  const guides = makeArray(55).map((value) => value * 3);
  const xPixels = (w-1)/3;
  const yPixels = (h-1)/3;
  const combined = ((xPixels*yPixels)*4);

  return makeArray((w*h) - combined).map(() => {

    const isYGuide = guides.includes(y);
    const guide = [x, y];

    if(x > 0 && x%(w-1)===0) {
      x = 0;
      y ++;
    }
    else {
      x += isYGuide ? 1 : 3;
    };

    return guide;

  });

};

class Grid extends DisplayObject {
  constructor(s, w, h, data = makeArray(w*h, () => 0)) {

    super();

    this.size = s;
    this.width = w;
    this.height = h;
    this.data = data;
    this.grid = mapToGrid(this.data, this.width);
    this.map = this.grid.map(([type, x, y]) => `x${x}y${y}`);
    this.guides = getGuides(w, h);
    this.sweeper = makeSweeper(this.size);
    this.rounder = new Rounder(this.size+1);
    this.fromSaved = data.filter((a) => a>0).length > 0;

    const gap = 1;
    const node = this.node = makeNode('div', 'grid');
    node.style.width = `${w*s+(gap*(w-1))}px`;
    node.style.height = `${h*s+(gap*(h-1))}px`;
    node.style.gap = `${gap}px`;

    this.guides.forEach(([x, y]) => {

      const pixel = makeNode('div', 'grid-pixel');
      pixel.dataset.x = x;
      pixel.dataset.y = y;
      pixel.dataset.state === 'wall';
      pixel.classList.add('guide');
      pixel.style.width = pixel.style.height = `${s}px`;
      pixel.style.position = 'absolute';
      pixel.style.left = `${x*s+(x+1)}px`;
      pixel.style.top = `${y*s+(y+1)}px`;
      node.append(pixel);
      this.pixels.push(pixel);

    });

    node.append(this.sweeper);

    this.fill();

    console.log(this);

  };
  fill() {

    this.guides.forEach(([x, y]) => {
      this.set(x, y, 'wall');
    });

    if(this.fromSaved) {
      this.grid.forEach(([type, x, y]) => {
        this.set(x, y, this.stateAttributeMap[type]);
      });
    };

    return this;

  };
  set(x, y, value) {

    const dataIndex = this.map.indexOf(`x${x}y${y}`);
    const pixel = this.get(x, y);
    this.data[dataIndex] = this.stateDataMap[value];
    if(pixel) {
      pixel.dataset.state = this.stateAttributeMap[this.data[dataIndex]];
    };
    return this;

  };
  get(x, y) {

    return this.node.querySelector([`[data-x="${x}"][data-y="${y}"]`]);

  };
  move(direction, disable) {

    let toErase = [];
		switch(direction) {
       case 'up':
         this.y -= 3;
         toErase = [
           [this.x, this.y+2],
           [this.x+1, this.y+2],
         ];
       break;
       case 'down':
         this.y += 3;
         toErase = [
           [this.x, this.y-1],
           [this.x+1, this.y-1],
         ];
       break;
       case 'left':
         this.x -= 3;
         toErase = [
           [this.x+2, this.y],
           [this.x+2, this.y+1],
         ];
       break;
       case 'right':
         this.x += 3;
         toErase = [
           [this.x-1, this.y],
           [this.x-1, this.y+1],
         ];
       break;
		};

		this.sweeper.style.left = `${(this.x*this.size)+this.x+1}px`;
    this.sweeper.style.top = `${(this.y*this.size)+this.y+1}px`;

    if(!disable) {
      toErase.forEach(([x, y]) => {
        this.set(x, y, 'empty');
      });
    };

		return this;

	};
  stateDataMap = {
    'wall': 1,
    'door': 2,
    'empty': 0
  };
  stateAttributeMap = ['empty', 'wall', 'door'];
  pixels = [];
  x = 1;
  y = 1;
};

export class Maker extends DisplayObject {
  constructor() {

    super();

    const maker = this.node = makeNode('div', 'maker');
    const inputs = makeNode('div', 'inputs');
    const inputsTop = makeNode('div', 'inputs-top');
    const inputsBottom = makeNode('div', 'inputs-bottom');
    const target = makeNode('div', 'grid-target');
    const difficulty = makeSelect(Object.keys(settings).map((a) => [a, a]));
    const mode = makeSelect([
      ['wall', 'wall'],
      ['door', 'door'],
      ['eraser', 'empty']
    ]);
    const tool = makeSelect([
      ['pen', 'pen'],
      ['eraser', 'eraser'],
    ]);
    const constrain = {
      'wall': 'guide',
      'door': 'guide',
      'empty': 'guide'
    };
    const set = makeSelect(makeArray(10).map((a) => [`#${a + 1}`, a]));
    const copyButton = makeButton('copy', 'copy');
    let props = settings[difficulty.value];
    const xPos = makeInput(props.xPos);
    const yPos = makeInput(props.yPos);
    const size = makeInput(props.size);
    const pixelSize = makeInput(props.pixelSize);
    const width = makeInput(props.width);
    const height = makeInput(props.height);
    const opacity = makeOpacitySlider();

    this.grid = null;

    size.step = 2;

    const changeHandler = () => {
      body.style.backgroundImage = `url(/mazes/maze-${Number(set.value) + 1}-${difficulty.value}.png)`;
      body.style.backgroundSize = `${size.value}px`;
      body.style.backgroundPosition = `calc(50% - ${xPos.value}px) calc(50% - ${yPos.value}px)`;
      if(this.grid) {
        this.grid.destroy();
      };
      this.grid = new Grid(Number(pixelSize.value), Number(width.value), Number(height.value), mazes[difficulty.value][set.value]);
      this.grid.appendTo(target);
    };

    difficulty.addEventListener('input', () => {
      props = settings[difficulty.value];
      xPos.value = props.xPos;
      yPos.value = props.yPos;
      size.value = props.size;
      pixelSize.value = props.pixelSize;
      width.value = props.width;
      height.value = props.height;
      changeHandler();
    });

    set.addEventListener('input', changeHandler);

    opacity.addEventListener('input', () => {
      target.style.opacity = opacity.value;
    });

    [set, difficulty, mode, tool, copyButton, opacity].forEach((input) => {
      inputsTop.append(input);
    });

    [xPos, yPos, size, pixelSize, width, height].forEach((input) => {
      input.addEventListener('input', changeHandler);
      inputsBottom.append(input);
    });

    inputs.append(inputsTop);
    // inputs.append(inputsBottom);

    maker.append(target);
    maker.append(inputs);

    changeHandler();

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(this.grid.data));
      copyButton.innerText = 'copied!';
      setTimeout(() => {
        copyButton.innerText = 'copy';
      }, 2000);
    });

    // additional listeners

    const
    directionsKeyMap = {
      ArrowLeft: 'left',
      ArrowUp: 'up',
      ArrowRight: 'right',
      ArrowDown: 'down'
    },
    directionsArray = Object.keys(directionsKeyMap);

    let knobs = null;
    let touch = null;
    let xMovement = 0;
    let yMovement = 0;
    let disable = false;

    document.addEventListener('keydown', (e) => {

      if(isValidKey(e.code, ['Space'])) {
        disable = true;
      };

      if(isValidKey(e.code, directionsArray)) {
        this.grid.move(directionsKeyMap[e.key], disable);
      };

    });

    document.addEventListener('keyup', (e) => {

      if(isValidKey(e.code, ['Space'])) {
        disable = false;
      };

    });

    target.addEventListener('touchstart', (e) => {

      knobs = [];
      touch = e.touches[0];
      xMovement = 0;
      yMovement = 0;

      if(['pen'].includes(tool.value)) {
        //
      };

      e.preventDefault();

    });

    target.addEventListener('touchmove', (e) => {

      if(['pen'].includes(tool.value)) {

        const knob = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
       	if(knob?.classList.contains(constrain[mode.value])) {
      		if(knobs.indexOf(knob)===-1) {
       			knobs.push(knob);
            this.grid.set(knob.dataset.x, knob.dataset.y, mode.value);
      		};
       	};
       	e.preventDefault();

      }
      else if(['eraser'].includes(tool.value)) {

        const {clientX: originalClientX, clientY: originalClientY} = touch;
        const {clientX, clientY} = e.touches[0];
        const x = this.grid.rounder.round(clientX - originalClientX);
        const y = this.grid.rounder.round(clientY - originalClientY);

        // if(!yMovement && x !== xMovement) {
        if(x !== xMovement) {
          document.dispatchEvent(new Event(x > xMovement ? 'drag-right' : 'drag-left'));
        };

        // if(!xMovement && y !== yMovement) {
        if(y !== yMovement) {
          document.dispatchEvent(new Event(y > yMovement ? 'drag-down' : 'drag-up'));
        };

        xMovement = x;
        yMovement = y;

      };

    });

    document.addEventListener('drag-up', () => {

      this.grid.move('up');

    });

    document.addEventListener('drag-down', () => {

      this.grid.move('down');

    });

    document.addEventListener('drag-right', () => {

      this.grid.move('right');

    });

    document.addEventListener('drag-left', () => {

      this.grid.move('left');

    });

  };
};
