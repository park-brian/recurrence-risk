const fs = require("fs");
const AWS = require("aws-sdk");
const express = require("express");
const helmet = require("helmet");
const getLogger = require("./services/logger");
const apiRouter = require("./services/api");
const config = require("./config.json");
const isProduction = process.env.NODE_ENV === "production";

AWS.config.update(config.aws);

const app = express();

// initialize logger
app.locals.logger = getLogger("recurrence-risk");

// add security headers to all responses
app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

app.use("/api", apiRouter);

// serve public folder during local development
if (!isProduction) app.use(express.static(config.server.client));

// global error handler
app.use((error, request, response, next) => {
  const { name, message } = error;
  request.app.locals.logger.error(error);

  // return less descriptive errors in production
  response.status(500).json(isProduction ? name : `${name}: ${message}`);
});

app.listen(config.server.port, () => {
  app.locals.logger.info(
    `Application is running on port: ${config.server.port}`,
  );
});
