import {
	DisplayObject,
} from '@jamesrock/rockjs';
import { Maker } from './Maker';

const body = document.body;

export class Make extends DisplayObject {
	constructor() {

		super();

    this.maker = new Maker();

    this.maker.appendTo(body);

		this.addListeners();

		console.log(this);

	};
	addListeners() {

	};
};
