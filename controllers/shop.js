import { Product } from '../models/product.js';


const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const ITEMS_PER_PAGE = 4; // Changed from 6 to 4
        const searchQuery = req.query.search || '';
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
        const sort = req.query.sort || '';

        // Debug logs
        console.log('Raw price inputs:', { minPrice: req.query.minPrice, maxPrice: req.query.maxPrice });
        console.log('Parsed price values:', { minPrice, maxPrice });

        const products = await Product.fetchAll({
            page,
            itemsPerPage: ITEMS_PER_PAGE,
            searchQuery,
            minPrice,
            maxPrice,
            sort
        });

        // Debug logs
        console.log('Sample product prices:', products.products.slice(0, 3).map(p => p.price));
        console.log('Price filter values:', { minPrice, maxPrice });
        console.log('Final query:', products.query);
        console.log('Total products matching query:', products.totalItems);

        res.render('shop/product-list', {
            prods: products.products,
            pageTitle: 'All Products',
            path: '/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < products.totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(products.totalItems / ITEMS_PER_PAGE),
            searchQuery,
            minPrice: req.query.minPrice || '',
            maxPrice: req.query.maxPrice || '',
            sort
        });
    } catch (err) {
        console.error('Error in getProducts:', err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

const getProduct = async (req, res, next) => {
    const prodId = req.params.productId;

    try {

        const product = await Product.findByPk(prodId);
        res.render('shop/product-details', {
            product: product,
            pageTitle: product.title,
            path: '/products'
        });
    } catch (err) {
        console.log(err);
    }

};


const getIndex = async (req, res, next) => {
    try {
        console.log("the value of req.session.loggedIn at getIndex  is : " + req.session.loggedIn);
        const products = await Product.fetchAll({
            page: 1,
            itemsPerPage: 4,
            searchQuery: '',
            minPrice: null,
            maxPrice: null,
            sort: ''
        });
        res.render('shop/index', {
            prods: products.products,
            pageTitle: 'Shop',
            path: '/'
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};


const getCart = async (req, res, next) => {
    try {

        const products = await req.user.getCart();
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
        });
    } catch (error) {
        console.log(error);
    }
};


const postCart = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const product = await Product.findByPk(prodId);
        const prod = await req.user.addToCart(product);
        console.log("product added to the cart is " + prod.matchedCount);
        res.redirect('/cart');
        return prod;
    }
    catch (err) {
        console.log(err);
    }
}

const postCartDeleteProduct = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const newCart = await req.user.deleteItemFromCart(prodId);
        res.redirect('/cart');
        return newCart;
    } catch (err) {
        console.log(err);
    }
};

const getOrders = async (req, res, next) => {
    try {
        const orders = await req.user.getOrder();
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders
        });
    } catch (err) {
        console.log(err);
    }
};

const postOrder = async (req, res, next) => {
    try {
        const order = await req.user.addOrder();
        res.redirect('/orders');
        return order;
    } catch (err) {
        console.log(err);
    }
}

const getCheckout = (req, res, next) => {

    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    });
};

export { getCart, postCart, getCheckout, getIndex, getOrders, getProduct, getProducts, postCartDeleteProduct, postOrder }