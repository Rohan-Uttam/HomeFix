// backend/config/aws.js
import AWS from "aws-sdk";
import env from "./env.js";
import logger from "./logger.js";

AWS.config.update({
  accessKeyId: env.aws.accessKeyId,
  secretAccessKey: env.aws.secretAccessKey,
  region: env.aws.region,
});

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

export const uploadToS3 = (Body, Key, ContentType = "application/octet-stream") => {
  if (!env.aws.bucket) {
    return Promise.reject(new Error("S3 bucket not configured in env"));
  }

  const params = {
    Bucket: env.aws.bucket,
    Key,
    Body,
    ContentType,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        logger.error(" S3 upload error: " + err.message);
        return reject(err);
      }
      logger.info(` S3 upload success: ${data.Location}`);
      resolve(data);
    });
  });
};

export default s3;
