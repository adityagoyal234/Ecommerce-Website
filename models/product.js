import { getDb } from '../util/database.js';
import mongoDb from 'mongodb';


class Product {
    constructor(title, price, description, imageUrl, id, userId, category = 'uncategorized') {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? mongoDb.ObjectId.createFromHexString(id) : null;
        this.userId = userId;
        this.category = category;
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

    static async fetchAll({ page = 1, itemsPerPage = 4, searchQuery = '', minPrice = null, maxPrice = null, sort = '' }) {
        try {
            const db = getDb();
            const skip = (page - 1) * itemsPerPage;

            // Build the query
            const query = {};

            // Add search condition
            if (searchQuery) {
                query.$or = [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            // Add price conditions
            if (minPrice !== null || maxPrice !== null) {
                query.$and = [];
                if (minPrice !== null) {
                    query.$and.push({
                        $expr: {
                            $gte: [{ $toDouble: "$price" }, minPrice]
                        }
                    });
                }
                if (maxPrice !== null) {
                    query.$and.push({
                        $expr: {
                            $lte: [{ $toDouble: "$price" }, maxPrice]
                        }
                    });
                }
            }

            // Build sort options
            let sortOptions = {};
            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        sortOptions = { price: 1 };
                        break;
                    case 'price_desc':
                        sortOptions = { price: -1 };
                        break;
                    case 'name_asc':
                        sortOptions = { title: 1 };
                        break;
                    case 'name_desc':
                        sortOptions = { title: -1 };
                        break;
                }
            }

            // Get total count for pagination
            const totalItems = await db.collection('products').countDocuments(query);

            // Fetch products with pagination
            const products = await db.collection('products')
                .find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(itemsPerPage)
                .toArray();

            return {
                products,
                totalItems,
                currentPage: page,
                hasNextPage: skip + itemsPerPage < totalItems,
                hasPreviousPage: page > 1,
                lastPage: Math.ceil(totalItems / itemsPerPage),
                query // For debugging
            };
        } catch (err) {
            console.error('Error in fetchAll:', err);
            throw err;
        }
    }

    static async fetchAllAdminProducts(userId, searchQuery = '', sortBy = '', minPrice = 0, maxPrice = Infinity, category = '', page = 1, limit = 12) {
        try {
            const db = getDb();
            let query = { userId: userId };

            // Add search functionality
            if (searchQuery) {
                query = {
                    $and: [
                        { userId: userId },
                        {
                            $or: [
                                { title: { $regex: searchQuery, $options: 'i' } },
                                { description: { $regex: searchQuery, $options: 'i' } }
                            ]
                        }
                    ]
                };
            }

            // Add price range filter
            query.price = { $gte: minPrice, $lte: maxPrice };

            // Add category filter
            if (category && category !== 'all') {
                query.category = category;
            }

            // Add sorting functionality
            let sortOptions = {};
            switch (sortBy) {
                case 'price_asc':
                    sortOptions = { price: 1 };
                    break;
                case 'price_desc':
                    sortOptions = { price: -1 };
                    break;
                case 'name_asc':
                    sortOptions = { title: 1 };
                    break;
                case 'name_desc':
                    sortOptions = { title: -1 };
                    break;
                default:
                    sortOptions = { _id: -1 }; // Default sort by newest
            }

            // Calculate pagination
            const skip = (page - 1) * limit;

            // Get total count for pagination
            const totalProducts = await db.collection('products').countDocuments(query);

            const products = await db.collection('products')
                .find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .toArray();

            return {
                products,
                totalProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit)
            };
        } catch (err) {
            console.log(err);
            throw err;
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

    static async getSearchSuggestions(query) {
        try {
            console.log('Model: Searching for suggestions with query:', query);
            const db = getDb();

            const suggestions = await db.collection('products')
                .find({
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                })
                .project({
                    title: 1,
                    price: 1,
                    _id: 0
                })
                .limit(5)
                .toArray();

            console.log('Model: Found suggestions:', suggestions);
            return suggestions;
        } catch (error) {
            console.error('Model: Error in getSearchSuggestions:', error);
            throw error;
        }
    }

    static async getCategories() {
        try {
            const db = getDb();
            const categories = await db.collection('products')
                .distinct('category');
            return categories;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

}

export { Product };