const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: [true, 'Email already exists'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  image: String,
  role: {
    type: String,
    required: [true, 'Please provide a role for this user'],
    enum: {
      values: ['super-admin', 'admin', 'instructor', 'student'],
      message: 'Role must be either: super-admin, admin, instructor or student',
    },
    default: 'student',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must have at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  lastLogin: Date,
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

//DELETING CONFIRMED PASSWORD BEFORE SAVING
userSchema.pre('save', async function (next) {
  // Run this if password is actually modified (Edge Case)
  if (!this.isModified('password')) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirm password
  this.passwordConfirm = undefined;
  next();
});

// Deleting courses field for admin and instructor
// userSchema.pre('save', function (next) {
//   if (this.role === 'admin' || this.role === 'instructor')
//     this.courses = undefined;
//   this.completedLectures = undefined;
//   next();
// });

// INSTANCE METHODS FOR USER
// A method to check if the password is correct before loggin in
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// A method to check if the password is modified after a timestamp(JWT timestamp)
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// A method to create user password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.deleteOldPhoto = async function () {
  await fs.unlink(
    `${__dirname}/../public/img/users/${this.image}.jpeg`,
    (err) => {
      if (err) return new AppError('Cannot delete this photo', 404);
    }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
