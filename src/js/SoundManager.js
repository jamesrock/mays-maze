export class SoundManager {
  constructor(sounds) {

    this.context = new AudioContext();
    this.sounds = sounds;
    this.buffers = {};

    this.loadSounds();

    console.log(this);

  };
  loadSounds() {

    Object.keys(this.sounds).forEach((key) => {
      this.loadSound(key, this.sounds[key]);
    });

  };
  loadSound(name, path) {

    fetch(path).then((r) => r.arrayBuffer()).then((response) => {

      this.context.decodeAudioData(response, (buffer) => {
        this.buffers[name] = buffer;
      }, () => {
        console.log('error!');
      });

    });

  };
  play(sound = 'point') {

    if(!this.buffers[sound]) {
      console.log(`${sound} not loaded!`);
      return;
    };

    const source = this.context.createBufferSource();
    source.buffer = this.buffers[sound];
    source.connect(this.context.destination);
    source.start();

  };
};
