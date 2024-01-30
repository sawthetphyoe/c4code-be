const mongoose = require('mongoose');
const Course = require('./courseModel');

const sectionSchema = new mongoose.Schema({
  index: Number,
  name: {
    type: String,
    required: [true, 'A section must have a name'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
  },
  duration: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

sectionSchema.statics.calcDuration = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: '$course',
        courseDuration: { $sum: '$duration' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      duration: stats[0].courseDuration,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      duration: 0,
    });
  }
};

sectionSchema.post('save', function () {
  this.constructor.calcDuration(this.course);
});

sectionSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcDuration(doc.course);
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
