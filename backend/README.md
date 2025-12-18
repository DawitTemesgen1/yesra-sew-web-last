# Yesra Sew - Listings Backend

High-performance Node.js/Express/MySQL backend for listings and images.

## Features

- ✅ RESTful API for listings CRUD operations
- ✅ Automatic image optimization (WebP, 1200px max, 85% quality)
- ✅ Multi-image upload support
- ✅ Full-text search
- ✅ Advanced filtering (category, price range, location, etc.)
- ✅ Pagination
- ✅ MySQL with optimized indexes for fast queries
- ✅ Transaction support for data integrity

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup MySQL Database

Make sure MySQL is installed and running, then:

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source database/schema.sql
```

Or use the npm script:
```bash
npm run db:setup
```

### 3. Configure Environment

```bash
# Copy the example env file
cp env.example .env

# Edit .env with your MySQL credentials
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Get All Listings
```
GET /api/listings?category=cars&page=1&limit=12&sort=created_at&order=DESC
```

Query Parameters:
- `category` - Filter by category (cars, homes, jobs, tenders)
- `search` - Search in title and description
- `brand` - Filter by brand (for cars)
- `min_price` - Minimum price
- `max_price` - Maximum price
- `location` - Filter by location
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `sort` - Sort field (default: created_at)
- `order` - Sort order (ASC/DESC, default: DESC)

### Get Single Listing
```
GET /api/listings/:id
```

### Create Listing
```
POST /api/listings
Content-Type: multipart/form-data

Body:
- title
- description
- price
- category
- location
- user_id
- custom_fields (JSON string)
- images (files, max 5)
```

### Update Listing
```
PUT /api/listings/:id
Content-Type: multipart/form-data

Body: (same as create, all optional)
- remove_images (array of image IDs to remove)
```

### Delete Listing
```
DELETE /api/listings/:id
```

## Performance Optimizations

1. **Image Optimization**: All images automatically converted to WebP format and resized
2. **Database Indexes**: Optimized indexes on frequently queried fields
3. **Connection Pooling**: MySQL connection pool for better performance
4. **Full-Text Search**: Fast search using MySQL FULLTEXT indexes
5. **Pagination**: Efficient pagination to handle large datasets

## Frontend Integration

Update your React app to use the new API:

```javascript
import listingsAPI from './services/listingsAPI';

// Fetch listings
const { data, pagination } = await listingsAPI.getListings({
    category: 'cars',
    page: 1,
    limit: 12
});

// Create listing
const formData = new FormData();
formData.append('title', 'My Car');
formData.append('price', 50000);
formData.append('category', 'cars');
formData.append('images', file1);
formData.append('images', file2);

await listingsAPI.createListing(formData);
```

## Database Schema

### listings table
- Stores all listing data
- JSON field for flexible custom fields
- Soft delete support
- Full-text search on title and description

### listing_images table
- Stores image URLs with display order
- Cascading delete when listing is deleted

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name yesrasew-api
pm2 save
pm2 startup
```

3. Setup nginx reverse proxy for better performance
4. Enable MySQL query cache and optimize configuration
