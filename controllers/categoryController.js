const AppError = require('./../utlis/appError');
const Category = require('./../models/categoryModel');
const Course = require('./../models/courseModel');
const catchAsync = require('./../utlis/catchAsync');
const controllerFactory = require('./ControllerFactory');

exports.createCategory = controllerFactory.createOne(Category);
exports.getAllCategories = controllerFactory.getAll(Category);
exports.getCategory = controllerFactory.getOne(Category);
// exports.updateCategory = controllerFactory.updateOne(Category);
// exports.deleteCategory = controllerFactory.deleteOne(Category);

exports.updateCategory = catchAsync(async (req, res, next) => {
  req.body.updatedAt = Date.now();
  const doc = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('No document found with that ID', 404));
  }

  if (category.numberOfCourses !== 0) {
    return next(
      new AppError(
        'Access Denined! One or more courses are associated with this category. Please try deleting them first!',
        400
      )
    );
  }

  const doc = await Category.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
