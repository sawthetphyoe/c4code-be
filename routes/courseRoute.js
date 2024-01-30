const express = require('express');
const courseController = require('./../controllers/courseController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.checkLogin);

router.route('/').get(courseController.getAllCourses);

router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(courseController.uploadCourseImage, courseController.updateCourse);

////////// Routes restricted to Super-Admin or Admin //////////
router.use(authController.restrictTo('super-admin', 'admin'));
router.post('/', courseController.createCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
