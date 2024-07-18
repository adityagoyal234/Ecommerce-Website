
import { Product } from '../models/product.js';


const getProducts = async (req, res, next) => {
    try {

        const products = await Product.fetchAll();
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All products',
            path: '/products'
        });
    } catch (err) {
        console.log(err);
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
        const products = await Product.fetchAll();
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        });
    } catch (err) {
        console.log(err);
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
        res.redirect('/products');
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