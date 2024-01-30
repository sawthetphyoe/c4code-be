const AppError = require('./../utlis/appError');
const Review = require('./../models/reviewModel');
const controllerFactory = require('./ControllerFactory');
const catchAsync = require('./../utlis/catchAsync');

const popOptions = [{ path: 'student', select: 'firstName lastName image' }];

exports.getAllReviews = controllerFactory.getAll(Review, popOptions);
exports.getReview = controllerFactory.getOne(Review, popOptions);
exports.updateReview = controllerFactory.updateOne(Review);
exports.deleteReview = controllerFactory.deleteOne(Review);

exports.createReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({
    student: req.body.student,
    course: req.body.course,
  });

  console.log(reviews);

  if (reviews.length > 0) {
    return next(new AppError('You have already reviewed on this course!', 404));
  }

  const doc = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
