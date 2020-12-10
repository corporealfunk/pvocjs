/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

// zero the array in place
const zeroArray = (data) => {
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
};

export {
  zeroArray,
};
