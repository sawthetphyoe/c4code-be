const express = require('express');
const authController = require('./../controllers/authController');
const fileController = require('./../controllers/fileController');

const router = express.Router();

router.use(authController.checkLogin);

router
  .route('/')
  .get(fileController.getAllFiles)
  .post(fileController.uploadFile, fileController.createFile);

router
  .route('/:id')
  .get(fileController.getFile)
  .delete(fileController.deleteFile);

module.exports = router;
