import { makeArray } from '@jamesrock/rockjs';

export class SoundManager {
  constructor(url) {

    this.sounds = makeArray(10, () => makeAudio(url));

  };
  play() {

    this.sounds[this.index].play();

    if(this.index<this.sounds.length-1) {
      this.index ++;
    }
    else {
      this.index = 0;
    };

  };
  index = 0;
};

const makeAudio = (url) => {
  const audio = new Audio(url);
  audio.preload = true;
  return audio;
};
