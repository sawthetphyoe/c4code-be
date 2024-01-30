const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utlis/appError');
const globalErrorHandler = require('./controllers/errorController');
const authController = require('./controllers/authController');
const userRouter = require('./routes/userRoute');
const courseRouter = require('./routes/courseRoute');
const categoryRouter = require('./routes/categoryRoute');
const lectureRouter = require('./routes/lectureRoute');
const enrollmentRouter = require('./routes/enrollmentRoute');
const fileRouter = require('./routes/fileRoute');
const sectionRouter = require('./routes/sectionRoute');
const reviewRouter = require('./routes/reviewRoute');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

////////// MIDDLEWARES
app.use(cors(corsOptions));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/lectures', lectureRouter);
app.use('/api/v1/enrollments', enrollmentRouter);
app.use('/api/v1/files', fileRouter);
app.use('/api/v1/sections', sectionRouter);
app.use('/api/v1/reviews', reviewRouter);

// Error thrwoing middleware for invalid routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
