const mongoose = require('mongoose');
const Section = require('./sectionModel');

const lectureSchema = new mongoose.Schema({
  index: Number,
  name: {
    type: String,
    required: [true, 'A lecture must have a name'],
  },
  url: {
    type: String,
    required: [true, 'A lecture must have a video url'],
  },
  section: {
    type: mongoose.Schema.ObjectId,
    ref: 'Section',
  },
  duration: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

lectureSchema.statics.calcDuration = async function (sectionId) {
  const stats = await this.aggregate([
    {
      $match: { section: sectionId },
    },
    {
      $group: {
        _id: '$section',
        sectionDuration: { $sum: '$duration' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Section.findByIdAndUpdate(sectionId, {
      duration: stats[0].sectionDuration,
    });
  } else {
    await Section.findByIdAndUpdate(sectionId, {
      duration: 0,
    });
  }
};

lectureSchema.post('save', function () {
  this.constructor.calcDuration(this.section);
});

lectureSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcDuration(doc.section);
});

const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;
