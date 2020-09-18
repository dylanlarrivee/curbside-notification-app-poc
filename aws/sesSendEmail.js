const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
  });

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

const sendEmail = (params) => {
    return ses.sendEmail(params).promise();
}

module.exports = sendEmail;
