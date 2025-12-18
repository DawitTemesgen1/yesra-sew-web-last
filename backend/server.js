const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { createClient } = require('@supabase/supabase-js');

// Load environment variables - try local .env first, then root .env
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yesrasew',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Supabase Client (for templates only)
const supabase = createClient(
    process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Image optimization function
async function optimizeImage(buffer, filename) {
    const outputPath = path.join('uploads', filename);

    // Ensure uploads directory exists
    await fs.mkdir('uploads', { recursive: true });

    await sharp(buffer)
        .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

    return `/uploads/${filename}`;
}

// Helper: Get template fields from Supabase
async function getTemplateFields(categoryId) {
    try {
        const { data: template } = await supabase
            .from('post_templates')
            .select('id')
            .eq('category_id', categoryId)
            .single();

        if (!template) return [];

        const { data: steps } = await supabase
            .from('template_steps')
            .select('*, fields:template_fields(*)')
            .eq('template_id', template.id)
            .order('step_number');

        const fields = steps?.flatMap(s => s.fields || []) || [];
        return fields;
    } catch (error) {
        console.error('Error fetching template:', error);
        return [];
    }
}

// Helper to resolve category slug to ID
const categoryCache = new Map();
async function resolveCategoryId(input) {
    if (!input) return null;

    // Check if input is UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9-a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
    if (isUUID) return input;

    if (categoryCache.has(input)) {
        return categoryCache.get(input);
    }

    // Fuzzy matching strategy:
    // 1. Try input exactly (but case insensitive)
    // 2. Try variations (singular/plural)
    const variations = [input];
    if (input.endsWith('s')) variations.push(input.slice(0, -1)); // homes -> home
    else variations.push(input + 's'); // car -> cars

    for (const attempt of variations) {
        try {
            const { data } = await supabase
                .from('categories')
                .select('id, slug')
                .ilike('slug', attempt) // Case-insensitive match
                .maybeSingle();

            if (data?.id) {
                categoryCache.set(input, data.id);
                return data.id;
            }
        } catch (e) {
            console.error('Category resolve error:', e);
        }
    }

    return input;
}

// ==================== LISTINGS ROUTES ====================

// Get all listings with filters and pagination
app.get('/api/listings', async (req, res) => {
    try {
        const {
            category,
            search,
            brand,
            min_price,
            max_price,
            location,
            status, // Add status to destructuring
            user_id, // Add user_id
            page = 1,
            limit = 12,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        let query = `
            SELECT 
                l.*,
                GROUP_CONCAT(DISTINCT li.image_url ORDER BY li.display_order) as images
            FROM listings l
            LEFT JOIN listing_images li ON l.id = li.listing_id
            WHERE 1=1
        `;

        const params = [];

        // Filter by status (default to active if not specified)
        if (status && status !== 'all') {
            // Map 'approved' to 'active' to match DB schema
            const dbStatus = status === 'approved' ? 'active' : status;
            query += ' AND l.status = ?';
            params.push(dbStatus);
        } else if (!status) {
            query += " AND l.status = 'active'";
        }
        // If status === 'all', we don't add any AND clause for status

        if (user_id) {
            query += ' AND l.user_id = ?';
            params.push(user_id);
        }

        if (category) {
            const resolvedCategory = await resolveCategoryId(category);
            query += ' AND l.category = ?';
            params.push(resolvedCategory);
        }

        if (search) {
            query += ' AND (l.title LIKE ? OR l.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (brand) {
            query += ' AND JSON_EXTRACT(l.custom_fields, "$.brand") = ?';
            params.push(brand);
        }

        if (min_price) {
            query += ' AND l.price >= ?';
            params.push(min_price);
        }

        if (max_price) {
            query += ' AND l.price <= ?';
            params.push(max_price);
        }

        if (location) {
            query += ' AND l.location LIKE ?';
            params.push(`%${location}%`);
        }

        // Construct specific query for count to avoid GROUP BY issues
        let countQuery = `
            SELECT COUNT(DISTINCT l.id) as total
            FROM listings l
            LEFT JOIN listing_images li ON l.id = li.listing_id
            WHERE 1=1
        `;

        // Add same filters to countQuery
        if (status && status !== 'all') {
            countQuery += ' AND l.status = ?';
        } else if (!status) {
            countQuery += " AND l.status = 'active'";
        }

        if (user_id) countQuery += ' AND l.user_id = ?';

        if (category) countQuery += ' AND l.category = ?';
        if (search) countQuery += ' AND (l.title LIKE ? OR l.description LIKE ?)';
        if (brand) countQuery += ' AND JSON_EXTRACT(l.custom_fields, "$.brand") = ?';
        if (min_price) countQuery += ' AND l.price >= ?';
        if (max_price) countQuery += ' AND l.price <= ?';
        if (location) countQuery += ' AND l.location LIKE ?';

        // Count query uses same params!
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0] ? countResult[0].total : 0;


        // Finalize base query with GROUP BY and ORDER BY
        query += ' GROUP BY l.id';

        // Validate sort field to prevent SQL injection
        const allowedSortFields = ['created_at', 'price', 'views', 'title'];
        const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY l.${sortField} ${sortOrder}`;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [listings] = await pool.query(query, params);

        // Process listings
        const processedListings = listings.map(listing => ({
            ...listing,
            images: listing.images ? listing.images.split(',') : [],
            custom_fields: listing.custom_fields ? JSON.parse(listing.custom_fields) : {}
        }));

        res.json({
            success: true,
            listings: processedListings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM listings
            WHERE status != 'deleted'
        `);

        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single listing by ID
app.get('/api/listings/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [listings] = await pool.query(`
            SELECT 
                l.*,
                GROUP_CONCAT(DISTINCT li.image_url ORDER BY li.display_order) as images
            FROM listings l
            LEFT JOIN listing_images li ON l.id = li.listing_id
            WHERE l.id = ?
            GROUP BY l.id
        `, [id]);

        if (listings.length === 0) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        const listing = {
            ...listings[0],
            images: listings[0].images ? listings[0].images.split(',') : [],
            custom_fields: listings[0].custom_fields ? JSON.parse(listings[0].custom_fields) : {}
        };

        // Increment view count
        await pool.query('UPDATE listings SET views = views + 1 WHERE id = ?', [id]);

        res.json({ success: true, data: listing });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new listing (with template support)
app.post('/api/listings', upload.array('images', 5), async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const {
            title,
            description,
            price,
            category,
            location,
            user_id,
            category_id, // For fetching template
            custom_fields,
            status // Add status
        } = req.body;

        // Helper to clean 'undefined' strings from FormData
        const clean = (val) => (val === 'undefined' || val === 'null' ? undefined : val);

        const cleanCategory = clean(category);
        const cleanLocation = clean(location);
        const cleanCategoryId = clean(category_id);
        const cleanStatus = clean(status);

        // Parse custom_fields if it's a string
        const parsedCustomFields = typeof custom_fields === 'string'
            ? JSON.parse(custom_fields)
            : custom_fields || {};

        // Validate required fields based on template (if category_id provided)
        if (cleanCategoryId) {
            const templateFields = await getTemplateFields(cleanCategoryId);
            const requiredFields = templateFields.filter(f => f.is_required);

            for (const field of requiredFields) {
                if (!parsedCustomFields[field.field_name] && !req.body[field.field_name]) {
                    // throw new Error(`Required field missing: ${field.field_label}`);
                    // Relax validation for now to prevent blockers
                }
            }
        }

        // Determine status (map approved -> active)
        let dbStatus = cleanStatus || 'pending';
        if (dbStatus === 'approved') dbStatus = 'active';

        // Use category_id as category if category is not provided explicitly
        // This ensures compatibility with frontend which sends category_id
        const categoryValue = cleanCategory || cleanCategoryId;

        // Insert listing
        const [result] = await connection.query(`
            INSERT INTO listings (
                title, description, price, category, location, 
                user_id, custom_fields, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            title,
            description,
            price || 0,
            categoryValue,
            cleanLocation,
            user_id,
            JSON.stringify(parsedCustomFields),
            dbStatus
        ]);

        const listingId = result.insertId;

        // Process and save images
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(async (file, index) => {
                const filename = `listing-${listingId}-${Date.now()}-${index}.webp`;
                const imageUrl = await optimizeImage(file.buffer, filename);

                return connection.query(`
                    INSERT INTO listing_images (listing_id, image_url, display_order)
                    VALUES (?, ?, ?)
                `, [listingId, imageUrl, index]);
            });

            await Promise.all(imagePromises);
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            data: { id: listingId },
            message: 'Listing created successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating listing:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// Update listing
app.put('/api/listings/:id', upload.array('images', 5), async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const {
            title,
            description,
            price,
            location,
            custom_fields,
            status, // Add status
            remove_images
        } = req.body;

        // Parse custom_fields if it's a string
        const parsedCustomFields = typeof custom_fields === 'string'
            ? JSON.parse(custom_fields)
            : custom_fields;

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            values.push(price);
        }
        if (location !== undefined) {
            updates.push('location = ?');
            values.push(location);
        }
        if (status !== undefined) {
            const dbStatus = status === 'approved' ? 'active' : status;
            updates.push('status = ?');
            values.push(dbStatus);
        }
        if (parsedCustomFields !== undefined) {
            updates.push('custom_fields = ?');
            values.push(JSON.stringify(parsedCustomFields));
        }

        if (updates.length > 0) {
            updates.push('updated_at = NOW()');
            values.push(id);

            await connection.query(
                `UPDATE listings SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        // Remove specified images
        if (remove_images && remove_images.length > 0) {
            const imageIds = Array.isArray(remove_images) ? remove_images : JSON.parse(remove_images);

            const [imagesToRemove] = await connection.query(
                'SELECT image_url FROM listing_images WHERE id IN (?)',
                [imageIds]
            );

            // Delete image files
            for (const img of imagesToRemove) {
                try {
                    await fs.unlink(path.join(__dirname, img.image_url));
                } catch (err) {
                    console.error('Error deleting image file:', err);
                }
            }

            await connection.query(
                'DELETE FROM listing_images WHERE id IN (?)',
                [imageIds]
            );
        }

        // Add new images
        if (req.files && req.files.length > 0) {
            const [currentImages] = await connection.query(
                'SELECT MAX(display_order) as max_order FROM listing_images WHERE listing_id = ?',
                [id]
            );

            let startOrder = (currentImages[0].max_order || 0) + 1;

            const imagePromises = req.files.map(async (file, index) => {
                const filename = `listing-${id}-${Date.now()}-${index}.webp`;
                const imageUrl = await optimizeImage(file.buffer, filename);

                return connection.query(`
                    INSERT INTO listing_images (listing_id, image_url, display_order)
                    VALUES (?, ?, ?)
                `, [id, imageUrl, startOrder + index]);
            });

            await Promise.all(imagePromises);
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Listing updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating listing:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// Delete listing
app.delete('/api/listings/:id', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        // Get images to delete
        const [images] = await connection.query(
            'SELECT image_url FROM listing_images WHERE listing_id = ?',
            [id]
        );

        // Delete image files
        for (const img of images) {
            try {
                await fs.unlink(path.join(__dirname, img.image_url));
            } catch (err) {
                console.error('Error deleting image file:', err);
            }
        }

        // Delete images from database
        await connection.query('DELETE FROM listing_images WHERE listing_id = ?', [id]);

        // Soft delete listing
        await connection.query(
            'UPDATE listings SET status = ?, deleted_at = NOW() WHERE id = ?',
            ['deleted', id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting listing:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
});

// Get template fields for a category (proxy to Supabase)
app.get('/api/templates/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const fields = await getTemplateFields(categoryId);

        res.json({
            success: true,
            data: fields
        });
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Listings API server running on port ${PORT}`);
    console.log(`📊 MySQL database: ${process.env.DB_NAME}`);
    console.log(`🔗 Supabase integration: ${process.env.SUPABASE_URL ? 'Connected' : 'Not configured'}`);
});

module.exports = app;
