-- Create database
CREATE DATABASE IF NOT EXISTS yesrasew CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yesrasew;

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    category VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    custom_fields JSON,
    status ENUM('active', 'pending', 'sold', 'deleted') DEFAULT 'active',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_category (category),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_price (price),
    FULLTEXT INDEX idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Listing images table
CREATE TABLE IF NOT EXISTS listing_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    INDEX idx_listing_id (listing_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data for testing
INSERT INTO listings (title, description, price, category, location, user_id, custom_fields) VALUES
('Toyota Corolla 2020', 'Excellent condition, low mileage', 450000.00, 'cars', 'Addis Ababa', 'user123', '{"brand": "Toyota", "year": 2020, "mileage": 25000, "fuel_type": "Petrol"}'),
('Modern 3BR Apartment', 'Spacious apartment in prime location', 8500000.00, 'homes', 'Bole, Addis Ababa', 'user456', '{"bedrooms": 3, "bathrooms": 2, "area": 150}'),
('Senior Software Engineer', 'Join our growing tech team', 45000.00, 'jobs', 'Addis Ababa', 'company789', '{"job_type": "Full-time", "experience": "5+ years", "skills": ["React", "Node.js"]}');
