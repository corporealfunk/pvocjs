import fs from 'fs';
import {
  writeFileAsync,
} from './fs';

const DIR = '/tmp/tapper';

class Tap {
  constructor(csvDirectory) {
    this.csvDirectory = csvDirectory;
    this.dataSet = {};
    this.flushCount = 0;
    this.time = Math.floor(+new Date() / 1000);
    this.keyOrder = [];
  }

  accumulate(key, samples) {
    if (this.dataSet[key] === undefined) {
      this.dataSet[key] = []
    }

    this.keyOrder.push(key);

    const rows = samples.map(sample => [sample]);

    rows.forEach(row => this.dataSet[key].push(row));
  }

  // writes accumulated data to csv files in the directory
  // a dataSet has keys that will be named as CSV files
  async flush(setName = null) {
    this.flushCount += 1;

    const flushName = setName || this.flushCount;

    const subDir = `${this.time}/${flushName}`;
    const dir = `${this.csvDirectory}/${subDir}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (const key of Object.keys(this.dataSet)) {
      const rows = this.dataSet[key];

      let contents = '';
      rows.forEach((row) => {
        contents += row.join(',');
        contents += "\n";
      });

      const keyI = String(this.keyOrder.indexOf(key));

      const fileName = `${dir}/${keyI.padStart(2, '0')}_${key}.csv`;

      await writeFileAsync(fileName, contents);
    }

    this.dataSet = {};
    this.keyOrder =[];
  }
}

const Tapper = new Tap(DIR);

export default Tapper;
