import fs, { unlinkSync } from 'fs';
import { readFileAsync } from '../src/fs';

const fileExists = (filepath) => {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch(e) {
    flag = false;
  }

  return flag;
};

const unlinkIfExists = (fileName) => {
  if (fileExists(fileName)) {
    unlinkSync(fileName);
  }
};

export {
  fileExists,
  unlinkIfExists,
};
