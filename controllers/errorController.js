const AppError = require('./../utlis/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field '${Object.keys(err.keyValue)[0]} : ${
    Object.values(err.keyValue)[0]
  }'. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleInvalidJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleExpiredJWTError = () =>
  new AppError('Your token has been expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming error or unknown error
  } else {
    console.log('ERROR ERROR ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went worng!!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let errClone = { ...err };
    console.log(err, errClone);
    errClone.message = err.message;

    if (err.name === 'CastError') {
      errClone = handleCastErrorDB(errClone);
    }

    if (err.code === 11000) {
      errClone = handleDuplicateFieldsDB(errClone);
    }

    if (err.name == 'ValidationError') {
      errClone = handleValidationErrorDB(errClone);
    }

    if (err.name === 'JsonWebTokenError') {
      errClone = handleInvalidJWTError();
    }

    if (err.name === 'TokenExpiredError') {
      errClone = handleExpiredJWTError();
    }
    sendErrorProd(errClone, res);
  }
};
