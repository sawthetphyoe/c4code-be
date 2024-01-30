const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utlis/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utlis/appError');
const sendEmail = require('./../utlis/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      data: user,
    },
  });
};

exports.register = catchAsync(async (req, res, next) => {
  req.body.password = process.env.DEFAULT_USER_PASSWORD;
  req.body.passwordConfirm = process.env.DEFAULT_USER_PASSWORD;

  // Remove password from output

  const newUser = await User.create(req.body);
  newUser.password = undefined;
  res.status(201).json({
    status: 'success',
    data: {
      data: newUser,
    },
  });

  // createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email) return next(new AppError('Please provide an email', 400));
  if (!password) return next(new AppError('Please provide an password', 400));

  // Check if user exists and password is correct
  let user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  user.lastLogin = Date.now();
  user = await User.findByIdAndUpdate(user._id, user, {
    new: true,
    runValidators: true,
  });

  // Send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.checkLogin = catchAsync(async (req, res, next) => {
  // console.log(req.cookies);
  // console.log(req);
  // Check if the JWT exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === 'loggedout') {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // JWT Verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exists in database
  const curUser = await User.findById(decoded.id);
  if (!curUser) {
    return next(
      new AppError('The user belonging to this JWT does no longer exist.', 401)
    );
  }

  // Check if the user changed the password after the JWT was issued
  if (curUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'It seemed like you recently changed the password! Please log in again.'
      )
    );
  }
  req.user = curUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('There is no user with this ID.', 404));
  }

  if (user.role === 'super-admin') {
    return next(new AppError('You cannot update a super-admin account!', 404));
  }

  user.password = process.env.DEFAULT_USER_PASSWORD;
  user.passwordConfirm = process.env.DEFAULT_USER_PASSWORD;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  // 1) Get user based on POSTed email
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('There is no user with ID.', 404));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});
