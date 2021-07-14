const crypto = require("crypto");
const AWS = require("aws-sdk");

async function enqueue(config, message) {
  const sqs = new AWS.SQS();
  const s3 = new AWS.S3();

  const { queueName } = config.sqs;
  const { bucket, inputKeyPrefix } = config.s3;

  const id = crypto.randomBytes(16).toString("hex");
  const s3Key = `${inputKeyPrefix}${id}.json`;
  const { QueueUrl: queueUrl } = await sqs
    .getQueueUrl({
      QueueName: queueName,
    })
    .promise();

  await s3
    .upload({
      Bucket: bucket,
      Key: s3Key,
      Body: JSON.stringify(message),
    })
    .promise();

  await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageDeduplicationId: id,
      MessageGroupId: id,
      MessageBody: JSON.stringify({
        bucket,
        key: s3Key,
      }),
    })
    .promise();

  return id;
}

/**
 * Processes messages from a queue
 * @param {*} config
 */
async function processMessages({
  queueName,
  visibilityTimeout = 60,
  pollInterval = 60,
  waitTime = 20,
  messageHandler,
  errorHandler = console.error,
}) {
  const sqs = new AWS.SQS();

  try {
    const { QueueUrl: queueUrl } = await sqs
      .getQueueUrl({
        QueueName: queueName,
      })
      .promise();

    // to simplify running multiple workers in parallel,
    // fetch one message at a time
    const data = await sqs
      .receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: visibilityTimeout,
        WaitTimeSeconds: waitTime,
      })
      .promise();

    if (data.Messages && data.Messages.length > 0) {
      const message = data.Messages[0];

      // while processing is not complete, update the message's visibilityTimeout
      const intervalId = setInterval(
        () =>
          sqs
            .changeMessageVisibility({
              QueueUrl: queueUrl,
              ReceiptHandle: message.ReceiptHandle,
              VisibilityTimeout: visibilityTimeout,
            })
            .send(),
        1000 * (visibilityTimeout * 0.8),
      );

      // processMessage should return a boolean status indicating success or failure
      try {
        await messageHandler(message);
      } catch (e) {
        await errorHandler(e, message);
      } finally {
        // remove original message from queue once processed
        clearInterval(intervalId);
        await sqs
          .deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          })
          .promise();
      }
    }
  } catch (e) {
    await errorHandler(e);
  } finally {
    // schedule processing next message
    setTimeout(
      () =>
        processMessages({
          queueName,
          visibilityTimeout,
          pollInterval,
          waitTime,
          messageHandler,
          errorHandler,
        }),
      1000 * pollInterval,
    );
  }
}

module.exports = {
  enqueue,
  processMessages,
};
