const createRange = (num: number, start = 0) => {
  return Array.from({ length: num }, (_, k) => k + start);
};

export default createRange;
