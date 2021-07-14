const express = require("express");
const compression = require("compression");
const config = require("../config.json");
const { withAsync } = require("./utils");
const { enqueue } = require("./queue");
const recurrence = require("./recurrence");

const api = express.Router();

api.use(express.json({ limit: "100MB" }));

api.use(compression());

api.get(
  "/ping",
  withAsync(async (request, response) => {
    response.json(await recurrence.ping());
  }),
);

api.post(
  "/:version(v1|v2)/risk/group-data",
  withAsync(async ({ body, params }, response) => {
    response.json(await recurrence[params.version].getRiskFromGroupData(body));
  }),
);

api.post(
  "/:version(v1|v2)/risk/individual-data",
  withAsync(async ({ body, params }, response) => {
    const shouldQueue = body.covariates.length > 0 || body.strata.length > 2;
    if (shouldQueue && !body.email) {
      throw new Error("Please provide an email.");
    }
    response.json(
      shouldQueue || body.email
        ? await enqueue(config, {
            version: params.version,
            functionName: "getRiskFromIndividualData",
            params: {
              ...body,
              timestamp: new Date().getTime(),
            },
          })
        : await recurrence[params.version].getRiskFromIndividualData(body),
    );
  }),
);

module.exports = api;
