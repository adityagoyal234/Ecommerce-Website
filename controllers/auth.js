import { User } from "../models/user.js";
import { getDb } from '../util/database.js';
import mongoDb from 'mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createTransport } from 'nodemailer';
import { promisify } from 'util';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
dotenv.config();

const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});






const getLogin = async (req, res, next) => {

    console.log("the value of req.session.loggedIn is : " + req.session.loggedIn);
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
};

const postLogin = async (req, res, next) => {
    try {
        const db = getDb();
        const email = req.body.email;
        const password = req.body.password;
        const user = await db.collection('users').findOne({ email: email });
        if (!user) {
            console.log("incorrect email");
            req.flash('error', 'incorrect email');
            return res.redirect('/login');
        }
        const checkPassword = await bcrypt.compare(password, user.password);
        if (checkPassword) {
            console.log("correct password");
            req.session.loggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
                console.log(err);
                return res.redirect('/');
            })
        }
        else {
            console.log("incorrect password");
            req.flash('error', 'incorrect password');
            return res.redirect('/login');
        }

    } catch (err) {
        console.log(err);
        next(err);
    }

};



const postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
};


const getSignup = async (req, res, next) => {
    try {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        }
        else {
            message = null;
        }
        res.render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: message,
            email: '',
            password: '',
            confirmPassword: ''
        });
    } catch (err) {
        console.log(err);
    }
}

const postSignup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Handle errors by re-rendering the signup page with error messages
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            errorMessage: errors.array()[0].msg, // Show the first error message
            validationErrors: errors.array() // Pass all validation errors to the view
        });
    }
    try {
        const db = getDb();
        const email = req.body.email;
        const password = req.body.password;
        //const confirmPassword = req.body.confirmPassword;
        const userDoc = await db.collection('users').findOne({ email: email });
        if (userDoc) {
            req.flash('error', 'Email already in use');
            return res.redirect('/signup');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User(hashedPassword, email, { items: [] }, null);
        await user.save();



        const mailOptions = {
            from: '<adityagoyal000234@gmail.com>',
            to: `${email}`,
            subject: `Success`,
            text: `you have successfully signed in using your email ${email}`
        };

        await transporter.sendMail(mailOptions);
        res.redirect('/login');
    } catch (err) {
        console.log(err);
    }
}

const getReset = async (req, res, next) => {
    try {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        }
        else {
            message = null;
        }
        res.render('auth/reset', {
            path: '/reset',
            pageTitle: 'Reset Password',
            errorMessage: message
        });
    } catch (err) {
        console.log(err);
    }
}

const postReset = async (req, res, next) => {
    try {

        const randomBytesAsync = promisify(crypto.randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString('hex');
        const db = getDb();
        const email = req.body.email;
        const userDoc = await db.collection('users').findOne({ email: email });
        if (!userDoc) {
            req.flash('error', 'No account with that email found.');
            return res.redirect('/reset');
        }
        await db.collection('users').updateOne(
            { email: email },
            {
                $set: {
                    resetToken: token,
                    resetTokenExpiration: Date.now() + 3600000 // 1 hour
                }
            }
        );
        await db.collection('users').updateOne({ email }, { $set: userDoc });
        const mailOptions = {
            from: 'adityagoyal000234@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click this link to set a new password: http://localhost:3000/reset/${token}`
        };
        res.redirect('/');
        await transporter.sendMail(mailOptions);
    }
    catch (err) {
        console.log(err);
    }
}

const getNewPassword = async (req, res, next) => {
    try {
        const db = getDb();
        const token = req.params.token;
        const userDoc = await db.collection('users').findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
        if (!userDoc) {
            console.log("token not available for updating password");
            return res.redirect('/new-password');
        }
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        }
        else {
            message = null;
        }
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'Update Password',
            errorMessage: message,
            userId: userDoc._id.toString(),
            passwordToken: token
        });
    } catch (err) {
        console.log(err);
    }
}

const postNewPassword = async (req, res, next) => {
    try {
        const db = getDb();
        const userId = req.body.userId;
        const passwordToken = req.body.passwordToken;
        const newPassword = req.body.password;

        const userDoc = await db.collection('users').findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId });
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await db.collection('users').updateOne(
            { _id: mongoDb.ObjectId.createFromHexString(userId) },
            {
                $set: {
                    resetToken: undefined,
                    resetTokenExpiration: undefined,
                    password: hashedPassword
                }
            }
        );
        return res.redirect('/login');
    } catch (err) {
        console.log(err);
    }
}
export { getLogin, postLogin, postLogout, getSignup, postSignup, getReset, postReset, getNewPassword, postNewPassword };