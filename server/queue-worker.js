const fsp = require("fs/promises");
const AWS = require("aws-sdk");
const { template } = require("lodash");
const { createTransport } = require("nodemailer");
const getLogger = require("./services/logger");
const { processMessages } = require("./services/queue");
const { stringifyCsv } = require("./services/utils");
const recurrence = require("./services/recurrence");
const logger = getLogger("recurrence-risk-queue");
const config = require("./config.json");

AWS.config.update(config.aws);

processMessages({
  ...config.sqs,
  messageHandler: async (message) => {
    console.log(message);
    const transport = createTransport(config.email.smtp);
    const s3 = new AWS.S3();
    let input = {};

    try {
      logger.info("Received message", message);
      const { bucket, key } = JSON.parse(message.Body);

      // receive and delete original message
      const { Body: inputJSON } = await s3
        .getObject({
          Bucket: bucket,
          Key: key,
        })
        .promise();

      await s3
        .deleteObject({
          Bucket: bucket,
          Key: key,
        })
        .promise();

      logger.info("Retrieved and deleted parameters from s3", { bucket, key });
      input = JSON.parse(inputJSON);
      const { version, functionName, params } = input;
      const start = new Date().getTime();
      const results = await recurrence[version][functionName](params);
      const duration = new Date().getTime() - start;
      logger.info(
        `Finished calculation in ${duration / 1000}s, sending results`,
      );

      const userSuccessEmailTemplate = template(
        await fsp.readFile("templates/user-success-email.html", "utf-8"),
      );

      await transport.sendMail({
        from: config.email.sender,
        to: params.email,
        subject: "Recurrence Risk Tool Results",
        html: userSuccessEmailTemplate(params),
        attachments: [
          {
            filename: "results.csv",
            content: stringifyCsv(results),
          },
        ],
      });

      logger.info(`Sent results email to: ${params.email}`);
    } catch (exception) {
      const adminFailureEmailTemplate = template(
        await fsp.readFile("templates/admin-failure-email.html", "utf-8"),
      );
      const userFailureEmailTemplate = template(
        await fsp.readFile("templates/user-failure-email.html", "utf-8"),
      );
      logger.error(exception);

      await transport.sendMail({
        from: config.email.sender,
        to: config.email.sender,
        subject: "Recurrence Risk Tool Failure",
        html: adminFailureEmailTemplate({
          ...input.params,
          id: message.MessageId,
          exception,
        }),
      });

      if (input.params) {
        // send user failure email only if parameters are available
        await transport.sendMail({
          from: config.email.sender,
          to: input.params.email,
          subject: "Recurrence Risk Tool Results",
          html: userFailureEmailTemplate(input.params),
        });
      }
    }
  },
});
