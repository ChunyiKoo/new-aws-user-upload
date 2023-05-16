const express = require("express");
const { Image } = require("../../db/models");
const {
 multipleFilesUpload,
 multipleMulterUpload,
 retrievePrivateFile,
} = require("../../awsS3");

const router = express.Router();

router.post("/:userId", multipleMulterUpload("images"), async (req, res) => {
 const { userId } = req.params;
 const keys = await multipleFilesUpload({ files: req.files });
 const images = await Promise.all(
  keys.map((key) => Image.create({ key, userId }))
 );
 const imageUrls = images.map((image) => retrievePrivateFile(image.key));
 return res.json(imageUrls);
});
// backend/routes/api/images.js

router.get("/:userId", async (req, res) => {
 const images = await Image.findAll({
  where: { userId: req.params["userId"] },
 });
 const imageUrls = images.map((image) => retrievePrivateFile(image.key));
 return res.json(imageUrls);
});

module.exports = router;
