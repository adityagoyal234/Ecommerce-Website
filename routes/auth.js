import express from 'express';
import * as authController from '../controllers/auth.js';
import { body, validationResult } from 'express-validator';
import { getDb } from '../util/database.js';

//const db = getDb();

/*
const { body } = new ExpressValidator({
    isEmailNotInUse: async value => {
      const user = await Users.findByEmail(value);
      if (user) {
        throw new Error('E-mail already in use');
      }
    },
  });
*/
const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    }), authController.postSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

export { router };