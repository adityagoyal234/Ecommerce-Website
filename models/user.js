import { getDb } from '../util/database.js';
import mongoDb from 'mongodb';


//in monogdb we use the concept of embedded documents and define our cart model 
//inside the user model only
class User {
    constructor(password, email, cart, id, resetToken, resetTokenExpiration) {
        this.password = password;
        this.email = email;
        this.cart = cart;
        this._id = id;
        this.resetToken = resetToken;
        this.resetTokenExpiration = resetTokenExpiration;
    }

    async save() {
        try {
            const db = getDb();
            return await db.collection('users').insertOne(this);
        }
        catch (err) {
            console.log(err);
        }
    }

    async getCart() {
        try {
            const db = getDb();
            const prodIds = this.cart.items.map(i => i.productId);

            console.log("the prodIds are " + prodIds);

            console.log("getCart function has started");

            const products = await db.collection('products').find({ _id: { $in: prodIds } }).toArray();

            if (!products || products.length === 0) {
                return []; // Return an empty array if no products are found
            }

            const prods = products.map(p => {
                const cartItem = this.cart.items.find(i => i.productId.toString() === p._id.toString());
                return {
                    ...p,
                    quantity: cartItem ? cartItem.quantity : 0 // Add a check for cartItem
                };
            });
            console.log("cart has been fetched sucessfully");
            return prods;
        } catch (err) {
            console.log(err);
            throw err; // Re-throw the error to be handled by the calling function
        }
    }

    async addOrder() {
        try {
            const db = getDb();
            const cart = await this.getCart();
            typeof this._id === 'string' ? console.log("yes order has  a string " + this._id) : console.log("no order has no string");
            const order = {
                items: cart,
                user: {
                    _id: mongoDb.ObjectId.createFromHexString(this._id),
                    email: this.email
                }
            }
            await db.collection('orders').insertOne(order);
            this.cart = { items: [] };
            await db.collection('users').updateOne(
                { _id: mongoDb.ObjectId.createFromHexString(this._id) },
                { $set: { cart: { items: [] } } }
            );
            return order;
        } catch (err) {
            console.log(err);
        }

    }

    async getOrder() {
        try {
            const db = getDb();
            return await db.collection('orders').find({ 'user._id': mongoDb.ObjectId.createFromHexString(this._id) }).toArray();
        } catch (err) {
            console.log(err);
        }
    }



    async addToCart(product) {
        try {
            const cartProductIndex = this.cart.items.findIndex(cp => {
                return cp.productId.toString() === product._id.toString();
            });
            console.log("the same product has been found at index no " + cartProductIndex);
            let newQuantity = 1;
            const updatedCartItems = [...this.cart.items];

            if (cartProductIndex >= 0) {
                newQuantity = this.cart.items[cartProductIndex].quantity + 1;
                updatedCartItems[cartProductIndex].quantity = newQuantity;
            } else {
                updatedCartItems.push({
                    productId: product._id,
                    quantity: newQuantity
                });
                console.log("productId no one is " + updatedCartItems[0].productId);
                //console.log("productId no two is " + updatedCartItems[1].productId);
            }
            const updatedCart = {
                items: updatedCartItems
            };
            updatedCart.items.forEach((el, index) => {
                console.log(`the product id for product no ${index} is ${el.productId}`);
            });
            const db = getDb();
            console.log("the current user id is " + this._id);
            typeof this._id === 'string' ? console.log("yes its a string " + this._id) : console.log("no not a string");
            return db
                .collection('users')
                .updateOne(
                    { _id: mongoDb.ObjectId.createFromHexString(this._id) },
                    { $set: { cart: updatedCart } }
                );
        } catch (err) {
            console.log(err);
        }

    }

    async deleteItemFromCart(prodId) {
        try {
            const updatedCartItems = this.cart.items.filter(item => {
                return item.productId.toString() !== prodId.toString();
            })
            const db = getDb();
            return await db.collection('users').updateOne(
                { _id: mongoDb.ObjectId.createFromHexString(this._id) },
                { $set: { cart: { items: updatedCartItems } } }
            );

        } catch (err) {
            console.log(err);
        }
    }

    static async findByPk(userId) {
        try {
            const db = getDb();
            console.log("the userId is " + userId);
            const uid = userId.toString();
            const userCursor = db.collection('users').find({ _id: mongoDb.ObjectId.createFromHexString(uid) });
            const user = await userCursor.next();
            console.log("the user is " + user);
            return user;
        } catch (err) {
            console.log(err);
        }
    }

}

export { User };



