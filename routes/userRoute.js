const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

// Routes that don't require login
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.use(authController.checkLogin);

// Routes that require login
router.get('/check-login', userController.getMe);
router.post('/updateMyPassword', authController.changePassword);
router.patch('/me', userController.uploadUserImage, userController.updateMe);

////////// Routes restricted to Super-Admin, Admin or Instructor//////////
router.use(authController.restrictTo('super-admin', 'admin', 'instructor'));
// Get All Users
router.route('/').get(userController.getAllUsers);
// Get A User
router.route('/:id').get(userController.getUser);

////////// Routes restricted to Super-Admin or Admin //////////
router.use(authController.restrictTo('super-admin', 'admin'));
// Resigter User
router.post('/register', authController.register);
// Update A User
router.patch('/:id', userController.uploadUserImage, userController.updateUser);
// Reset User Password
router.patch('/resetPassword/:id', authController.resetPassword);
// Delete User
router.delete('/:id', userController.deleteUser);

module.exports = router;
