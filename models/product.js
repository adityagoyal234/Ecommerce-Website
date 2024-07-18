

import { getDb } from '../util/database.js';
import mongoDb from 'mongodb';


class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? mongoDb.ObjectId.createFromHexString(id) : null;
        this.userId = userId;
    }

    async save() {
        try {
            let result;
            const db = getDb();
            if (this._id) {
                result = await db
                    .collection('products')
                    .updateOne({ _id: this._id }, { $set: this });
            }
            else {
                await db.collection('products').insertOne(this);
                result = await db.collection('products').find(this).toArray();
            }
            console.log('hiu', result);
            return result;
        }
        catch (err) {
            console.log(err);
        }
    }

    static async fetchAll() {
        try {
            const db = getDb();
            const products = await db.collection('products').find().toArray();
            // const productCursor = db.collection('products').find({ title: 'hg' });
            //const product = await productCursor.next();
            //console.log(product.title);
            //console.log(products);
            console.log("fetched all shop products");
            return products;
        } catch (err) {
            console.log(err);
        }
    }

    static async fetchAllAdminProducts(userId) {
        try {
            const db = getDb();
            const products = await db.collection('products').find({ userId: userId }).toArray();
            // const productCursor = db.collection('products').find({ title: 'hg' });
            //const product = await productCursor.next();
            //console.log(product.title);
            //console.log(products);
            console.log("fetched all admin products");
            return products;
        } catch (err) {
            console.log(err);
        }
    }

    static async findByPk(prodId) {
        try {
            const db = getDb();
            const productCursor = prodId instanceof mongoDb.ObjectId ? db.collection('products').find({ _id: prodId }) : db.collection('products').find({ _id: mongoDb.ObjectId.createFromHexString(prodId) });
            const product = await productCursor.next();
            console.log(product);
            return product;
        } catch (err) {
            console.log(err);
        }
    }

    static async deleteByPk(prodId) {
        try {
            const db = getDb();
            const productCursor = db.collection('products').find({ _id: mongoDb.ObjectId.createFromHexString(prodId) });
            const product = await productCursor.next();
            if (product) {
                await db.collection('products').deleteOne({ _id: product._id });
            }
            const products = await db.collection('products').find().toArray();
            console.log("sucessfully deleted");
            return products;
        }
        catch (err) {
            console.log(err);
        }
    }

}

export { Product };