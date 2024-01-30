const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a student ID for this enrollment'],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide a course ID for this enrollment'],
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  completedLectures: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
    },
  ],
  completed: {
    type: Boolean,
    default: false,
  },
  currentLecture: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lecture',
  },
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
