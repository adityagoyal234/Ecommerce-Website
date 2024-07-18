import express from 'express';
//body-parser module is included inside express by default
import bodyParser from 'body-parser';
import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import connectFlash from 'connect-flash';
import csurf from 'csurf';

import { adminRoutes } from './routes/admin.js';
import { shopRoutes } from './routes/shop.js';
import { User } from './models/user.js'
import { router } from './routes/auth.js';
import { get404 } from './controllers/error.js';
import { mongoConnect } from './util/database.js';

import dotenv from 'dotenv';
dotenv.config();

const MongoDBStore = connectMongoDBSession(session);

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONGODB_URI = process.env.MONGODB_URI;
const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

const csrfProtection = csurf();
app.use(connectFlash());

app.set('view engine', 'ejs');
app.set('views', './views');//it tells where to find the template. default option is views only so it was not required to write but still wrote it for clarity



//import { pool } from './util/database.js';
/*
import { sequelize } from './util/database.js';
import { Product } from './models/product.js';
import { Cart } from './models/cart.js'
import { CartItem } from './models/cart-item.js'
import { Order } from './models/order.js'
import { OrderItem } from './models/order-item.js'
*/



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use(csrfProtection);

/*
app.use(async (req, res, next) => {
    try {
        const user = await User.findByPk('6651cd79e9c9151be090e854');
        if (user) {
            req.user = new User(user.name, user.email, user.cart, user._id);
        }
        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
});
*/

app.use(async (req, res, next) => {
    try {
        if (!req.session.user) {
            console.log("no req.session.user");
            return next();
        }
        console.log("the req.session.user._id is " + req.session.user._id);
        const userData = await User.findByPk(req.session.user._id);
        if (!userData) {
            return next();
        }
        if (userData) {
            req.user = new User(
                userData.password,
                userData.email,
                userData.cart,
                userData._id.toString() // Ensure _id is a string
            );
        }

        if (req.user) {
            console.log("the username is:::: " + req.user.email);
        }

        next();
    } catch (err) {
        throw new Error(err);
    }
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.loggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

mongoConnect(() => {
    app.use('/admin', adminRoutes);
    app.use(shopRoutes);
    app.use(router);
    app.use(get404);

    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});



/*
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

//both lines mean the same thing
User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });

sequelize
    // .sync({ alter: true }) //do it to overwrite the product table so that we can have the user table in association with it and then remove it
    .sync()
    .then(result => {
        // console.log(res);
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({ name: 'Max', email: 'adit@goyal.com' })
        }
        return user;
    })
    .then(user => {
        //  console.log(user);
        return user.createCart();
    })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
    */





