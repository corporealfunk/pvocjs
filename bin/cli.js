#!/usr/bin/env node

const yargs = require('yargs');
const cliProgress = require('cli-progress');

const Pvoc = require('../dist/pvoc.js').default;
const Aiff = require('../dist/aiff.js').default;

const argv = yargs
  .option('input', {
    alias: 'i',
    description: 'Input aiff (only mono support right now)',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    description: 'Output aiff (only mono support right now)',
    type: 'string',
  })
  .option('bands', {
    alias: 'b',
    description: 'Number of bands in FFT: must be in range 8-4096 power of 2',
    type: 'number',
  })
  .option('overlap', {
    alias: 'v',
    description: 'Overlap: must be one of 0.5, 1, 2, 4',
    type: 'number',
  })
  .option('timescale', {
    alias: 't',
    description: 'Time scale factor',
    type: 'number',
  })
  .help()
  .alias('help', 'h')
  .argv;

const { i, o, b, t, v } = argv;

if (!i) {
  console.error('Input File not specified');
  return;
}

if (!o) {
  console.error('Output File not specified');
  return;
}

if (!b) {
  console.error('Bands not specified');
  return;
}

if (!v) {
  console.error('Overlap not specified');
  return;
}

if (!t) {
  console.error('Time scale not specified');
  return;
}

const input = new Aiff(i);
const output = new Aiff(o);

input.openForRead().then(() => {
  return output.openForWrite({
    sampleRate: input.sampleRate,
    bitDepth: input.bitDepth,
    numChannels: input.numChannels,
  });
}).then(() => {
  const pvoc = new Pvoc({
    bands: parseInt(b),
    overlap: parseFloat(v),
    scaleFactor: parseFloat(t),
  });

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  let progressBarStarted = false;

  pvoc.on('progress', ({ numSamples, samplesRead }) => {
    if (!progressBarStarted) {
      progressBar.start(numSamples, samplesRead);
      progressBarStarted = true;
      return;
    }

    if (samplesRead > numSamples) {
      progressBar.update(numSamples);
      progressBar.stop();
    } else {
      progressBar.update(samplesRead);
    }
  });

  return pvoc.run(input, output);
}).catch((err) => {
  console.error(`ERROR: ${err.message}`);
}).finally(() => {
  return input.close().then(() => {;
    output.close();
  });
});
