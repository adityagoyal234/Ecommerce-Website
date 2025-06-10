import express from 'express';

import * as adminController from '../controllers/admin.js';

import { isAdmin } from '../middleware/is-auth.js';

const adminRoutes = express.Router();


//'/add-product' is an optional addition which relates to path. It uses string matching
//to execute the function if the url starts with the path name. the url doesnt have to 
// the same till the time it starts with the path entered
adminRoutes.get('/add-product', isAdmin, adminController.getAddProduct);

adminRoutes.get('/products', isAdmin, adminController.getProducts);

adminRoutes.get('/edit-product/:productId', isAdmin, adminController.getEditProduct);

adminRoutes.post('/edit-product', isAdmin, adminController.postEditProduct);

//we can use app.use also the only diff is that it will run the code eveytime we land
//on the url however using app.post we ensure that it runs only if it is reached via
//a post request
adminRoutes.post('/add-product', isAdmin, adminController.postAddProduct);

adminRoutes.post('/delete-product', isAdmin, adminController.postDeleteProduct);

export { adminRoutes };
