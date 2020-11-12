import { promisify } from 'util';
import fs from 'fs';

const readAsync = promisify(fs.read);
const openAsync = promisify(fs.open);
const closeAsync = promisify(fs.close);

export {
  readAsync,
  openAsync,
  closeAsync,
};
