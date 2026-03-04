import { Maker } from './Maker';

const body = document.body;

export class Make {
	constructor() {

    this.maker = new Maker();

    this.maker.appendTo(body);

		console.log(this);

	};
};
