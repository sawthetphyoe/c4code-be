const express = require('express');
const lectureController = require('./../controllers/lectureController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.checkLogin);

router.route('/').get(lectureController.getAllLectures);

router
  .route('/:id')
  .get(lectureController.getLecture)
  .patch(lectureController.updateLecture)
  .delete(lectureController.deleteLecture);

////////// Routes restricted to Super-Admin or Admin //////////
router.use(authController.restrictTo('super-admin', 'admin'));
router.post('/', lectureController.createLecture);
module.exports = router;
