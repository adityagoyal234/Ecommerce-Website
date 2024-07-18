import express from 'express';

const shopRoutes = express.Router();

import * as shopController from '../controllers/shop.js';

import { routeProtection } from '../middleware/is-auth.js';

//the path '/' is as good as empty. means this will work for all url's
shopRoutes.get('/', shopController.getIndex);

shopRoutes.get('/products', shopController.getProducts);

shopRoutes.get('/products/:productId', shopController.getProduct);// a colon allows us to get a dynamic id

shopRoutes.post('/cart', routeProtection, shopController.postCart);

shopRoutes.get('/cart', routeProtection, shopController.getCart);

shopRoutes.post('/cart-delete-item', routeProtection, shopController.postCartDeleteProduct);

shopRoutes.post('/create-order', routeProtection, shopController.postOrder);

shopRoutes.get('/orders', routeProtection, shopController.getOrders);

//shopRoutes.get('/checkout', shopController.getCheckout);

export { shopRoutes };
