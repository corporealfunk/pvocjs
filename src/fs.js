import { promisify } from 'util';
import fs from 'fs';

const readAsync = promisify(fs.read);
const writeAsync = promisify(fs.write);
const openAsync = promisify(fs.open);
const closeAsync = promisify(fs.close);
const readFileAsync = promisify(fs.readFile);

export {
  readAsync,
  writeAsync,
  openAsync,
  closeAsync,
  readFileAsync,
};
