import '/css/app.css';
import {
	setDocumentHeight,
} from '@jamesrock/rockjs';
import { Make } from './Make';
import { Play } from './Play';

setDocumentHeight();

const mode = 'play'; // make, play

const modes = {
  'make': () => {
    new Make();
  },
  'play': () => {
    new Play();
  },
};

modes[mode]();
