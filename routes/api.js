import express from 'express';
import { Product } from '../models/product.js';

const router = express.Router();

router.get('/search-suggestions', async (req, res) => {
    try {
        const query = req.query.q;
        console.log('API: Received search query:', query);

        if (!query || query.length < 2) {
            console.log('API: Query too short or empty');
            return res.json([]);
        }

        const suggestions = await Product.getSearchSuggestions(query);
        console.log('API: Found suggestions:', suggestions);

        res.json(suggestions);
    } catch (error) {
        console.error('API: Error in search suggestions:', error);
        res.status(500).json({ error: 'Failed to fetch search suggestions' });
    }
});

export { router as apiRoutes }; 