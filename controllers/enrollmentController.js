const catchAsync = require('../utlis/catchAsync');
const Enrollment = require('./../models/enrollmentModel');
const controllerFactory = require('./ControllerFactory');
const mongoose = require('mongoose');
const AppError = require('./../utlis/appError');

const popOptions = [
  { path: 'student', select: 'firstName lastName email role' },
  { path: 'course', select: 'name duration' },
  { path: 'currentLecture', select: 'name url' },
  { path: 'completedLectures', select: 'name duration' },
];

exports.createEnrollment = controllerFactory.createOne(Enrollment);
exports.getEnrollment = controllerFactory.getOne(Enrollment, popOptions);
exports.getAllEnrollments = controllerFactory.getAll(Enrollment, popOptions);
exports.updateEnrollment = controllerFactory.updateOne(Enrollment);
exports.deleteEnrollment = controllerFactory.deleteOne(Enrollment);

// const updateCompletedLectures = (action) => {
//   return catchAsync(async (req, res, next) => {
//     let doc;
//     if (action === 'add') {
//       doc = await Enrollment.findByIdAndUpdate(
//         req.params.id,
//         { $push: { completedLectures: req.body.lectureId } },
//         { new: true, runValidators: true }
//       );
//     } else {
//       doc = await Enrollment.findByIdAndUpdate(
//         req.params.id,
//         { $pull: { completedLectures: req.body.lectureId } },
//         {
//           new: true,
//           runValidators: true,
//         }
//       );
//     }

//     if (!doc) {
//       return next(new AppError('No document found with that ID', 404));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         data: doc,
//       },
//     });
//   });
// };

exports.updateCompletedLectures = catchAsync(async (req, res, next) => {
  let doc;
  if (req.body.action === 'add') {
    doc = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $push: { completedLectures: req.body.lectureId } },
      { new: true, runValidators: true }
    );
  } else {
    doc = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $pull: { completedLectures: req.body.lectureId } },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

// exports.addCompletedLecture = updateCompletedLectures('add');
// exports.deleteCompletedLecture = updateCompletedLectures('delete');
