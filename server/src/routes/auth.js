const express      = require('express');
const router       = express.Router();
const { body }     = require('express-validator');
const authController = require('../controllers/authController');
const { protect }  = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  asyncHandler(authController.login)
);

router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout',  protect, asyncHandler(authController.logout));
router.get('/me',       protect, asyncHandler(authController.getMe));

module.exports = router;
