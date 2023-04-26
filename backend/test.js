const createSearchIndexes = (...args) => {
  const str = args.map(arg => arg.trim().replace(/\s\s+/g, ' ')).join(' ');
  let res = [];
  const min = 3;
  if (!!str && str.length > min) {
    str.split(" ").forEach((token) => {
      if (token.length > min) {
        for (let i = min; i <= str.length && i <= token.length; ++i) {
          res = [...res, token.substr(0, i)];
        }
      } else {
        res = [...res, token];
      }
    });
  }
  return res.length === 0 ? [str] : res;
}

