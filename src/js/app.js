import '/css/app.css';
import { setDocumentHeight } from '@jamesrock/rockjs';
import { Make } from './Make';
import { Play } from './Play';

setDocumentHeight();

const mode = 'make'; // make, play

const modes = {
  'make': () => {
    new Make();
  },
  'play': () => {
    new Play();
  },
};

modes[mode]();
