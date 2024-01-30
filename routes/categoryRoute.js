const express = require('express');
const categoryController = require('./../controllers/categoryController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.checkLogin);

router.get('/', categoryController.getAllCategories);

router.get('/:id', categoryController.getCategory);

////////// Routes restricted to Super-Admin or Admin //////////
router.use(authController.restrictTo('super-admin', 'admin'));

router.post('/', categoryController.createCategory);

router
  .route('/:id')
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
