class BufferLoader {
  constructor(context, sounds, callback) {

    const buffers = {};
    const keys = Object.keys(sounds);
    let loaded = 0;

    const loadSound = (name, path) => {

      var request = new XMLHttpRequest();
      request.open('GET', path, true);
      request.responseType = 'arraybuffer';

      request.onload = () => {
        context.decodeAudioData(request.response, (buffer) => {
          buffers[name] = buffer;
          loaded ++;
          if(loaded===keys.length) {
            callback(buffers);
          };
        }, () => {
          console.log('error!');
        });
      };

      request.send();

    };

    keys.forEach((key) => {
      loadSound(key, sounds[key]);
    });

  };
};

export class SoundManager {
  constructor(sounds) {

    this.context = new AudioContext();
    this.buffers = {};

    new BufferLoader(this.context, sounds, (items) => {
      this.buffers = items;
    });

  };
  play(sound = 'point') {

    const source = this.context.createBufferSource();
    source.buffer = this.buffers[sound];
    source.connect(this.context.destination);
    source.start();

  };
};
