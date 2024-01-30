const express = require('express');
const sectionController = require('./../controllers/sectionController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.checkLogin);

router.route('/').get(sectionController.getAllSections);

router
  .route('/:id')
  .get(sectionController.getSection)
  .patch(sectionController.updateSection)
  .delete(sectionController.deleteSection);

////////// Routes restricted to Super-Admin or Admin //////////
router.use(authController.restrictTo('super-admin', 'admin'));
router.post('/', sectionController.createSection);

module.exports = router;
