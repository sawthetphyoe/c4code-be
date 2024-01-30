const AppError = require('./../utlis/appError');
const catchAsync = require('./../utlis/catchAsync');
const controllerFactory = require('./ControllerFactory');
const multer = require('multer');
const File = require('./../models/fileModel');
const Course = require('../models/courseModel');
const fs = require('fs');

const popOptions = [{ path: 'uploadedBy', select: 'firstName lastName' }];

// PDF File Upload
const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/files');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}---${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.split('/')[1] === 'pdf') {
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Unsupported file type! Only files in pdf format are allowed to upload.',
          400
        ),
        false
      );
    }
  },
});

exports.uploadFile = fileUpload.single('file');

exports.getAllFiles = controllerFactory.getAll(File, popOptions);
exports.getFile = controllerFactory.getOne(File, popOptions);
exports.deleteFile = catchAsync(async (req, res, next) => {
  const doc = await File.findById(req.params.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  fs.unlink(`${__dirname}/../public/files/${doc.name}`, (err) => {
    if (err) return next(new AppError('Cannot delete this file', 404));
  });

  await File.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please attach a file!', 404));
  }

  req.body.name = req.file.filename;

  req.body.uploadedBy = req.user._id;

  const doc = await File.create(req.body);

  if (req.body.course && req.user.role !== 'student') {
    const course = await Course.findById(req.body.course);

    if (!course) {
      return next(new AppError('No course found with that ID!', 404));
    }

    await Course.findByIdAndUpdate(
      req.body.course,
      { $push: { files: doc._id } },
      { new: true, runValidators: true }
    );
  }

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
