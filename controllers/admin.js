//import { where } from 'sequelize';
import { Product } from '../models/product.js';
import express from 'express';
import * as adminController from '../controllers/admin.js';
import { isAdmin } from '../middleware/is-auth.js';

// Helper function to validate URL
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
}

const postAddProduct = async (req, res, next) => {
    try {
        const title = req.body.title?.trim();
        const price = req.body.price;
        const description = req.body.description?.trim();
        const imageUrl = req.body.imageUrl?.trim();

        // Server-side validation
        const errors = [];

        if (!title || title.length === 0) {
            errors.push('Title is required');
        }

        if (!imageUrl || imageUrl.length === 0) {
            errors.push('Image URL is required');
        } else if (!isValidUrl(imageUrl)) {
            errors.push('Please enter a valid image URL');
        }

        if (!price || price <= 0) {
            errors.push('Price is required and must be greater than 0');
        }

        if (!description || description.length === 0) {
            errors.push('Description is required');
        }

        // If there are validation errors, re-render the form with errors
        if (errors.length > 0) {
            return res.render('admin/edit-product', {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                errorMessage: errors.join(', '),
                validationErrors: errors,
                oldInput: {
                    title: title || '',
                    imageUrl: imageUrl || '',
                    price: price || '',
                    description: description || ''
                }
            });
        }

        const product = new Product(title, price, description, imageUrl, null, req.user._id);
        const result = await product.save();
        console.log('Created Product');
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            errorMessage: 'An error occurred while creating the product',
            oldInput: {
                title: req.body.title || '',
                imageUrl: req.body.imageUrl || '',
                price: req.body.price || '',
                description: req.body.description || ''
            }
        });
    }
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
        const updatedTitle = req.body.title?.trim();
        const updatedImgUrl = req.body.imageUrl?.trim();
        const updatedPrice = req.body.price;
        const updatedDesc = req.body.description?.trim();

        // Server-side validation
        const errors = [];

        if (!updatedTitle || updatedTitle.length === 0) {
            errors.push('Title is required');
        }

        if (!updatedImgUrl || updatedImgUrl.length === 0) {
            errors.push('Image URL is required');
        } else if (!isValidUrl(updatedImgUrl)) {
            errors.push('Please enter a valid image URL');
        }

        if (!updatedPrice || updatedPrice <= 0) {
            errors.push('Price is required and must be greater than 0');
        }

        if (!updatedDesc || updatedDesc.length === 0) {
            errors.push('Description is required');
        }

        // If there are validation errors, re-render the form with errors
        if (errors.length > 0) {
            return res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                errorMessage: errors.join(', '),
                validationErrors: errors,
                product: {
                    _id: prodId,
                    title: updatedTitle || '',
                    imageUrl: updatedImgUrl || '',
                    price: updatedPrice || '',
                    description: updatedDesc || ''
                }
            });
        }

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
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            errorMessage: 'An error occurred while updating the product',
            product: {
                _id: req.body.productId,
                title: req.body.title || '',
                imageUrl: req.body.imageUrl || '',
                price: req.body.price || '',
                description: req.body.description || ''
            }
        });
    }
};

const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const ITEMS_PER_PAGE = 4;
        const searchQuery = req.query.search || '';
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
        const sort = req.query.sort || '';

        console.log('Admin getProducts - User ID:', req.user._id);
        console.log('Admin getProducts - User ID type:', typeof req.user._id);
        console.log('Admin getProducts - Search params:', { searchQuery, minPrice, maxPrice, sort, page });

        const result = await Product.fetchAllAdminProducts({
            userId: req.user._id,
            page: page,
            itemsPerPage: ITEMS_PER_PAGE,
            searchQuery: searchQuery,
            minPrice: minPrice,
            maxPrice: maxPrice,
            sort: sort
        });

        console.log('Admin getProducts - Result:', result);
        console.log('Admin getProducts - Products count:', result.products.length);

        res.render('admin/products', {
            prods: result.products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < result.totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(result.totalItems / ITEMS_PER_PAGE),
            searchQuery: searchQuery,
            minPrice: req.query.minPrice || '',
            maxPrice: req.query.maxPrice || '',
            sort: sort,
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