/**
 * Passes async errors to error-handling middleware
 * @param {function} fn - An asynchronous middleware function
 * @returns The middleware function decorated with an error handler
 */
function withAsync(fn) {
  return async (request, response, next) => {
    try {
      return await fn(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Generates rfc4180-compliant csv files from arrays of arrays/objects
 * If an array of objects is provided, the config.headers property
 * allows the user to specify headers as an array of strings
 *
 * @param data
 * @param config
 * @returns
 */
function stringifyCsv(data, config) {
  const defaultConfig = {
    delimiter: ",",
    newline: "\r\n",
  };

  let { delimiter, newline, headers } = {
    ...defaultConfig,
    ...config,
  };

  const escape = (value) =>
    typeof value !== "number"
      ? `"${String(value).replace(/"/g, '""')}"`
      : value;

  const rows = [];

  for (let row of data) {
    if (!Array.isArray(row)) {
      if (!headers) {
        headers = Object.keys(row);
      }
      if (rows.length === 0) {
        rows.push(headers.map(escape).join(delimiter));
      }
      row = headers.map((header) => row[header]);
    }

    rows.push(row.map(escape).join(delimiter));
  }

  return rows.join(newline);
}

module.exports = {
  stringifyCsv,
  withAsync,
};
