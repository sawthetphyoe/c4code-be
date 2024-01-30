const Course = require('./../models/courseModel');
const controllerFactory = require('./ControllerFactory');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const catchAsync = require('../utlis/catchAsync');
const AppError = require('../utlis/appError');
const Category = require('../models/categoryModel');

const popOptions = [
  { path: 'instructors', select: 'firstName lastName' },
  { path: 'category', select: 'name' },
  {
    path: 'files',
    populate: {
      path: 'uploadedBy',
      model: 'User',
      select: 'firstName lastName',
    },
  },
];

////////// Configuring storage with 'multer' //////////
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

////////// Image related Controllers //////////
exports.uploadCourseImage = upload.single('image');

exports.createCourse = controllerFactory.createOne(Course);
exports.getAllCourses = controllerFactory.getAll(Course, popOptions);
exports.getCourse = controllerFactory.getOne(Course, popOptions);
exports.deleteCourse = controllerFactory.deleteOne(Course);

exports.updateCourse = catchAsync(async (req, res, next) => {
  let oldImage;
  if (req.file) {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new AppError('No course found with that ID', 404));
    }

    oldImage = course.image;
    const imageName = `course-${course._id}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
      .resize(400, 240)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/images/${imageName}`);

    // Set image
    req.body.image = imageName;
  }

  // Change updated date for user
  req.body.updatedAt = Date.now();

  const doc = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (oldImage) {
    fs.unlink(`${__dirname}/../public/images/${oldImage}`, (err) => {
      if (err) return next(new AppError('Cannot delete this photo', 404));
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
