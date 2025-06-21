//import { where } from 'sequelize';
import { Product } from '../models/product.js';

const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
}

const postAddProduct = async (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    const product = new Product(title, price, description, imageUrl, null, req.user._id);
    try {
        const result = await product.save();
        console.log('why', result);
        console.log('Created Product');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }

    /*
    const product = new Product(null, title, imageUrl, description, price);
    product.save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        });
        */

    /*
req.user
    .createProduct({
        title: title,
        imageUrl: imageUrl,
        description: description,
        price: price
    })
    .then(result => {
        //console.log(result);
        console.log("created new product");
        res.redirect('/admin/products');
    })
    .catch(err => {
        console.log(err);
    });
    */
};


const getEditProduct = async (req, res, next) => {
    //check if edit is set in the request
    try {

        const editMode = req.query.edit;
        if (!editMode) {
            return res.redirect('/');
        }
        const prodId = req.params.productId;



        const product = await Product.findByPk(prodId);
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    } catch (err) {
        console.log(err);
    }



    /*
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    });
    */

    /*
        req.user
            .getProducts({ where: { id: prodId } })
            //Product.findByPk(prodId)
            .then(products => {
                const product = products[0];
                if (!product) {
                    return res.redirect('/');
                }
                else {
                    res.render('admin/edit-product', {
                        pageTitle: 'Edit Product',
                        path: '/admin/edit-product',
                        editing: editMode,
                        product: product
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
            */
}

const postEditProduct = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        const updatedTitle = req.body.title;
        const updatedImgUrl = req.body.imageUrl;
        const updatedPrice = req.body.price;
        const updatedDesc = req.body.description;

        const product = new Product(
            updatedTitle,
            updatedPrice,
            updatedDesc,
            updatedImgUrl,
            prodId,
            req.user._id
        );

        await product.save();
        console.log("updated product successfully");

        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }



    /*
    const updatedProduct = new Product(
        prodId,
        updatedTitle,
        updatedImgUrl,
        updatedDescription,
        updatedPrice
    );
    updatedProduct.save();
    
    */


    /*
    Product
        .findByPk(prodId)
        .then(product => {
            product.title = updatedTitle;
            product.imageUrl = updatedImgUrl;
            product.description = updatedDescription;
            product.price = updatedPrice;
            product.save();
        })
        .then(result => { // this one is for product.save
            console.log("sucess");
            res.redirect('/admin/products');
        })
        .catch(err => {//for findByPk
            console.log(err);
        })
    // res.redirect('/admin/products');
    */
};

const getProducts = async (req, res, next) => {
    try {
        const searchQuery = req.query.search || '';
        const sortBy = req.query.sort || '';
        const page = parseInt(req.query.page) || 1;

        console.log('Admin getProducts - User ID:', req.user._id);
        console.log('Admin getProducts - User ID type:', typeof req.user._id);

        // Debug: Check all products in database
        await Product.debugAllProducts();

        const result = await Product.fetchAllAdminProducts({
            userId: req.user._id,
            searchQuery: searchQuery,
            sort: sortBy,
            page: page
        });

        console.log('Admin getProducts - Result:', result);
        console.log('Admin getProducts - Products count:', result.products.length);

        res.render('admin/products', {
            prods: result.products,
            pageTitle: 'All products',
            path: '/admin/products',
            searchQuery: searchQuery,
            sort: sortBy,
            currentPage: result.currentPage,
            hasNextPage: result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage,
            lastPage: result.lastPage,
            totalItems: result.totalItems
        });
    } catch (err) {
        console.log('Admin getProducts - Error:', err);
        next(err);
    }
};

const postDeleteProduct = async (req, res, next) => {
    try {
        const prodId = req.body.productId;
        await Product.deleteByPk(prodId);
        console.log("successfully deleted!!!");
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
    }
}
/*
const postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product
        .findByPk(prodId)
        .then(product => {
            return product.destroy();
        })
        .then(result => {//for product.destroy
            console.log("deleted product");
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });

    // Product.deleteById(prodId);
    //res.redirect('/admin/products');
}

export { getAddProduct, postAddProduct, getProducts, getEditProduct, postEditProduct, postDeleteProduct };
*/

const testAdmin = (req, res, next) => {
    console.log('=== TEST ADMIN FUNCTION CALLED ===');
    console.log('Session user:', req.session.user);
    console.log('User role:', req.session.user?.role);
    console.log('User ID:', req.session.user?._id);
    res.send('Admin test route working!');
};

const fixStringPrices = async (req, res, next) => {
    try {
        await Product.fixStringPrices();
        res.send('String prices fixed successfully! Check console for details.');
    } catch (err) {
        console.error('Error fixing string prices:', err);
        res.status(500).send('Error fixing string prices');
    }
};

export { getAddProduct, postAddProduct, getProducts, getEditProduct, postEditProduct, postDeleteProduct, testAdmin, fixStringPrices };