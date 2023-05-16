// backend/awsS3.js

const AWS = require("aws-sdk");
const multer = require("multer");
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const NAME_OF_BUCKET = "happyappbucket"; // <-- Use your bucket name here

// backend/awsS3.js

const singleFileUpload = async ({ file, public = false }) => {
 const { originalname, buffer } = file;
 const path = require("path");

 // Set the name of the file in your S3 bucket to the date in ms plus the
 // extension name.
 const Key = new Date().getTime().toString() + path.extname(originalname);
 const uploadParams = {
  Bucket: NAME_OF_BUCKET,
  Key: public ? `public/${Key}` : Key,
  Body: buffer,
 };
 const result = await s3.upload(uploadParams).promise();

 // Return the link if public. If private, return the name of the file in your
 // S3 bucket as the key in your database for subsequent retrieval.
 return public ? result.Location : result.Key;
};
// Since a public file is publicly accessible, you can simply return a link to its location in your S3 bucket (result.Location).
// for private files, you just return the key/filename (result.Key).

// backend/awsS3.js

const multipleFilesUpload = async ({ files, public = false }) => {
 return await Promise.all(
  files.map((file) => {
   return singleFileUpload({ file, public });
  })
 );
};

// backend/awsS3.js

const retrievePrivateFile = (key) => {
 let fileUrl;
 if (key) {
  //S3 includes a helpful function, getSignedUrl, that will generate a link with temporary and limited authentication built in. Write a function to return a link authorized for getting/reading the specified object:
  //The aws-sdk package uses your IAM credentials in the .env file to authorize this call to s3.getSignedUrl.
  fileUrl = s3.getSignedUrl("getObject", {
   Bucket: NAME_OF_BUCKET,
   Key: key,
  });
 }
 return fileUrl || key;
};

// backend/awsS3.js

const storage = multer.memoryStorage({
 destination: function (req, file, callback) {
  callback(null, "");
 },
});

const singleMulterUpload = (nameOfKey) =>
 multer({ storage: storage }).single(nameOfKey);
const multipleMulterUpload = (nameOfKey) =>
 multer({ storage: storage }).array(nameOfKey);

module.exports = {
 s3,
 singleFileUpload,
 multipleFilesUpload,
 retrievePrivateFile,
 singleMulterUpload,
 multipleMulterUpload,
};
