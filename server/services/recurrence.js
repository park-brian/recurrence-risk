const path = require("path");
const r = require("r-wrapper").async;
const sourcePathV1 = path.resolve(__dirname, "recurrenceV1.R");
const sourcePathV2 = path.resolve(__dirname, "recurrenceV2.R");

module.exports = {
  ping: r.bind(r, sourcePathV2, "ping"),
  v1: {
    getRiskFromGroupData: r.bind(r, sourcePathV1, "getRiskFromGroupData"),
    getRiskFromIndividualData: r.bind(
      r,
      sourcePathV1,
      "getRiskFromIndividualData",
    ),
  },
  v2: {
    getRiskFromGroupData: r.bind(r, sourcePathV2, "getRiskFromGroupData"),
    getRiskFromIndividualData: r.bind(
      r,
      sourcePathV2,
      "getRiskFromIndividualData",
    ),
  },
};
