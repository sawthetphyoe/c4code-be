const AppError = require('./../utlis/appError');
const Lecture = require('./../models/LectureModel');
const controllerFactory = require('./ControllerFactory');
// const catchAsync = require('./../utlis/catchAsync');

exports.createLecture = controllerFactory.createOne(Lecture);
exports.getAllLectures = controllerFactory.getAll(Lecture);
exports.getLecture = controllerFactory.getOne(Lecture);
exports.updateLecture = controllerFactory.updateOne(Lecture);
exports.deleteLecture = controllerFactory.deleteOne(Lecture);
