const mongoose = require('mongoose');
const Course = require('./courseModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Please provide a review.'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Review must belong to a course'],
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a student'],
  },
});

reviewSchema.statics.calcRating = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: '$course',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      numOfRating: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      numOfRating: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcRating(this.course);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcRating(doc.course);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
