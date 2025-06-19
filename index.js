let $ = x => document.querySelector(x);
let audioContext;
addEventListener('DOMContentLoaded', () => {
  let f = async () => {
    let b = $('#audio').files[0];
    if (!b) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    warp(await audioContext.decodeAudioData(await new Blob([b], { type: b.type }).arrayBuffer()));
  }
  // $('#audio').addEventListener('change', f);
  $('#start').addEventListener('click', f);
});

/** @param {AudioBuffer} b */
function warp(b) {
  // if (stop) stop();
  // audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 32;
  let samples = b.getChannelData(0);

  var da = parseInt($('#da').value);
  var db = parseInt($('#db').value) / 100;
  var dc = b.sampleRate / parseInt($('#dc').value);
  var dd = (1 - parseInt($('#dd').value) / 100) ** 10;
  // var dd = 1.0 / (1.0 + Math.exp(-ddc / b.sampleRate));
  var ddp = 0;
  samples = samples
    .map(x => ddp = dd * x + (1 - dd) * ddp)
    .map((_, i, a) => a[Math.floor(i / dc) * dc])
    .map(x => Math.floor(x * da) / da)
    .map(x => x > db ? db : x < -db ? -db : x)
    .map(x => x * Math.max(0.5 / db, 1))
  // .map((x, i, a) => x + (a[i - Math.floor(b.sampleRate / 16)] || 0) / 2);

  // const source = audioContext.createBufferSource();
  // source.buffer = audioContext.createBuffer(1, samples.length, b.sampleRate);
  // source.buffer.getChannelData(0).forEach((_, i, a) => a[i] = samples[i]);
  // source.connect(audioContext.destination);
  // source.start();
  // stop = () => source.stop();
  piss(samples, b.sampleRate);
}

let stop;
let analyser;

function tick() {
  const freqdata = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqdata);
  const visualizer = Array.from(freqdata);
}

function piss(a, s) {
  let enc = new lamejs.Mp3Encoder(1, s, 128);
  let data = [];
  data.push(enc.encodeBuffer(new Int16Array(a.length).map((_, i) => a[i] * 32768)));
  data.push(enc.flush());
  let url = URL.createObjectURL(new Blob(data, {type: 'audio/mp3'}));
  $('#output').src = url;
  $('#output').controls = true;
}