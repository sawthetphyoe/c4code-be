const mongoose = require('mongoose');
const Category = require('./categoryModel');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a course name'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a short description for the course'],
  },
  code: {
    type: String,
    required: [true, 'Please provide a course code'],
  },
  image: String,
  ratingsAverage: { type: Number, default: 0 },
  numOfRating: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  files: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'File',
    },
  ],
  instructors: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category for the course'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  active: {
    type: Boolean,
    default: false,
  },
});

// courseSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'lectures',
//     select: '-__v -createdAt',
//   });
//   next();
// });

courseSchema.statics.calcCategCourses = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$category',
        numOfCourses: { $sum: 1 },
      },
    },
  ]);

  await Category.updateMany({}, { numberOfCourses: 0 });

  for (categ of stats) {
    await Category.findByIdAndUpdate(categ._id, {
      numberOfCourses: categ.numOfCourses,
    });
  }
};

courseSchema.post('save', function () {
  this.constructor.calcCategCourses(this.category);
});

courseSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcCategCourses();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
