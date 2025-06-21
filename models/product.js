import { getDb } from '../util/database.js';
import mongoDb from 'mongodb';


class Product {
    constructor(title, price, description, imageUrl, id, userId, category = 'uncategorized') {
        this.title = title;
        this.price = typeof price === 'string' ? parseFloat(price) : price;
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
                console.log('Product.save() - Updating product with _id:', this._id, 'Type:', typeof this._id);
                result = await db
                    .collection('products')
                    .updateOne({ _id: this._id }, { $set: this });
                console.log('Product.save() - Update result:', result);
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
            let useAggregation = false;
            let sortDirection = 1;

            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        sortDirection = 1;
                        useAggregation = true;
                        break;
                    case 'price_desc':
                        sortDirection = -1;
                        useAggregation = true;
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

            let products;

            if (useAggregation) {
                // Use aggregation pipeline for price sorting to handle numeric conversion
                const pipeline = [
                    { $match: query },
                    { $addFields: { priceAsNumber: { $toDouble: "$price" } } },
                    { $sort: { priceAsNumber: sortDirection } },
                    { $skip: skip },
                    { $limit: itemsPerPage },
                    { $project: { priceAsNumber: 0 } } // Remove the temporary field
                ];

                products = await db.collection('products').aggregate(pipeline).toArray();
            } else {
                // Use regular find for non-price sorting
                products = await db.collection('products')
                    .find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(itemsPerPage)
                    .toArray();
            }

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

    static async fetchAllAdminProducts({ userId, page = 1, itemsPerPage = 4, searchQuery = '', minPrice = null, maxPrice = null, sort = '' }) {
        try {
            const db = getDb();
            const skip = (page - 1) * itemsPerPage;

            // Use userId as string since that's how it's stored in the database
            console.log('fetchAllAdminProducts - Original userId:', userId);
            console.log('fetchAllAdminProducts - Using userId as string:', userId);

            // Build the query - use userId as string
            const query = { userId: userId };

            // Add search condition
            if (searchQuery) {
                query.$and = [
                    { userId: userId },
                    {
                        $or: [
                            { title: { $regex: searchQuery, $options: 'i' } },
                            { description: { $regex: searchQuery, $options: 'i' } }
                        ]
                    }
                ];
            }

            // Add price conditions only if specified
            if (minPrice !== null || maxPrice !== null) {
                if (!query.$and) {
                    query.$and = [{ userId: userId }];
                }

                const priceCondition = {};
                if (minPrice !== null) {
                    priceCondition.$gte = minPrice;
                }
                if (maxPrice !== null) {
                    priceCondition.$lte = maxPrice;
                }

                query.$and.push({
                    $expr: {
                        $and: Object.entries(priceCondition).map(([op, val]) => ({
                            [op]: [{ $toDouble: "$price" }, val]
                        }))
                    }
                });
            }

            console.log('fetchAllAdminProducts - Final query:', JSON.stringify(query, null, 2));

            // Build sort options
            let sortOptions = {};
            let useAggregation = false;
            let sortDirection = 1;

            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        sortDirection = 1;
                        useAggregation = true;
                        break;
                    case 'price_desc':
                        sortDirection = -1;
                        useAggregation = true;
                        break;
                    case 'name_asc':
                        sortOptions = { title: 1 };
                        break;
                    case 'name_desc':
                        sortOptions = { title: -1 };
                        break;
                }
            } else {
                sortOptions = { _id: -1 }; // Default sort by newest
            }

            // Get total count for pagination
            const totalItems = await db.collection('products').countDocuments(query);
            console.log('fetchAllAdminProducts - Total items found:', totalItems);

            let products;

            if (useAggregation) {
                // Use aggregation pipeline for price sorting to handle numeric conversion
                const pipeline = [
                    { $match: query },
                    { $addFields: { priceAsNumber: { $toDouble: "$price" } } },
                    { $sort: { priceAsNumber: sortDirection } },
                    { $skip: skip },
                    { $limit: itemsPerPage },
                    { $project: { priceAsNumber: 0 } } // Remove the temporary field
                ];

                products = await db.collection('products').aggregate(pipeline).toArray();
            } else {
                // Use regular find for non-price sorting
                products = await db.collection('products')
                    .find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(itemsPerPage)
                    .toArray();
            }

            console.log('fetchAllAdminProducts - Products found:', products.length);
            if (products.length > 0) {
                console.log('fetchAllAdminProducts - First product userId:', products[0].userId);
                console.log('fetchAllAdminProducts - First product userId type:', typeof products[0].userId);
            }

            return {
                products,
                totalItems,
                currentPage: page,
                hasNextPage: skip + itemsPerPage < totalItems,
                hasPreviousPage: page > 1,
                lastPage: Math.ceil(totalItems / itemsPerPage)
            };
        } catch (err) {
            console.error('Error in fetchAllAdminProducts:', err);
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

    static async fixStringPrices() {
        try {
            const db = getDb();
            console.log('=== FIXING STRING PRICES ===');

            // Find all products with string prices
            const productsWithStringPrices = await db.collection('products')
                .find({ price: { $type: "string" } })
                .toArray();

            console.log(`Found ${productsWithStringPrices.length} products with string prices`);

            if (productsWithStringPrices.length > 0) {
                for (const product of productsWithStringPrices) {
                    const numericPrice = parseFloat(product.price);
                    if (!isNaN(numericPrice)) {
                        await db.collection('products').updateOne(
                            { _id: product._id },
                            { $set: { price: numericPrice } }
                        );
                        console.log(`Fixed product "${product.title}": "${product.price}" -> ${numericPrice}`);
                    } else {
                        console.log(`Warning: Could not convert price "${product.price}" for product "${product.title}"`);
                    }
                }
                console.log('=== STRING PRICES FIXED ===');
            } else {
                console.log('No products with string prices found');
            }
        } catch (err) {
            console.error('Error in fixStringPrices:', err);
            throw err;
        }
    }

    static async debugAllProducts() {
        try {
            const db = getDb();
            const allProducts = await db.collection('products').find({}).toArray();
            console.log('=== DEBUG: All Products ===');
            console.log('Total products in database:', allProducts.length);
            allProducts.forEach((product, index) => {
                console.log(`Product ${index + 1}:`, {
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    priceType: typeof product.price,
                    userId: product.userId,
                    userIdType: typeof product.userId
                });
            });
            console.log('=== END DEBUG ===');
            return allProducts;
        } catch (err) {
            console.error('Error in debugAllProducts:', err);
            throw err;
        }
    }

}

export { Product };