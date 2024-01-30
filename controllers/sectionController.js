const AppError = require('./../utlis/appError');
const Section = require('./../models/sectionModel');
const controllerFactory = require('./ControllerFactory');
// const catchAsync = require('./../utlis/catchAsync');

exports.createSection = controllerFactory.createOne(Section);
exports.getAllSections = controllerFactory.getAll(Section);
exports.getSection = controllerFactory.getOne(Section);
exports.updateSection = controllerFactory.updateOne(Section);
exports.deleteSection = controllerFactory.deleteOne(Section);
