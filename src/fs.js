import { promisify } from 'util';
import fs from 'fs';

const readAsync = promisify(fs.read);
const writeAsync = promisify(fs.write);
const openAsync = promisify(fs.open);
const closeAsync = promisify(fs.close);
const readFileAsync = promisify(fs.readFile);
const statAsync = promisify(fs.stat);
const writeFileAsync = promisify(fs.writeFile);

export {
  readAsync,
  writeAsync,
  openAsync,
  closeAsync,
  readFileAsync,
  statAsync,
  writeFileAsync,
};
