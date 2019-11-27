export function fetchApi(url, options = {}) {
  return fetch(url, {
    mode: "cors",
    method: "GET",
    ...options
  }).then(res => {
    if (res.ok || res.status === 404) {
      return Promise.resolve(res);
    }

    return Promise.reject(res);
  });
}

export function queryFormatHelper(queryParams = {}) {
  const keys = Object.keys(queryParams);

  if (keys.length === 0) {
    return "";
  }

  return keys.reduce((acc, key, index) => {
    const prefix = index === 0 ? "?" : "&";
    const param = `${key}=${encodeURIComponent(queryParams[key])}`;

    return `${acc}${prefix}${param}`;
  }, "");
}
