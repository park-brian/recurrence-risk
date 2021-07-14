const config = require("../../server/config.json");

module.exports = {
  "/api": {
    target: `http://localhost:${config.server.port}`,
    secure: false,
    logLevel: "debug",
  },
};
