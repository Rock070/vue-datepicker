// TODO: 錯誤處理
function pipe<T>(
  first: (param: T) => any,
  ...rest: Function[]
): (params: T) => any {
  return function (param: T) {
    let legacyReturn = first(param);
    const queue = [...rest];
    while (queue.length > 0) {
      if (queue[0] === undefined) continue;
      legacyReturn = queue[0](legacyReturn);
      queue.shift();
    }

    return legacyReturn;
  };
}

export default pipe;
