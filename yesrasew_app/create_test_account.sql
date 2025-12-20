-- Create Test Account for Google Play Store Reviewers
-- Run this in Supabase SQL Editor

-- Step 1: Create the auth user
-- Note: You'll need to do this via Supabase Dashboard Authentication > Users
-- Email: playstore.reviewer@yesrasewsolution.com
-- Password: GoogleReview2024!
-- Make sure to check "Auto Confirm User"

-- Step 2: After creating the user in the dashboard, get the user ID and run this:
-- Replace 'USER_ID_HERE' with the actual UUID from the auth.users table

-- Insert profile data
INSERT INTO profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    role,
    verified,
    is_active,
    created_at,
    updated_at
) VALUES (
    'USER_ID_HERE', -- Replace with actual user ID from auth.users
    'playstore.reviewer@yesrasewsolution.com',
    'Google Play Reviewer',
    'Google',
    'Reviewer',
    '+251911223344',
    'user',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    verified = true,
    is_active = true;

-- Optional: Add some sample listings for the reviewer to see
INSERT INTO listings (
    title,
    description,
    category_id,
    price,
    location,
    city,
    author_id,
    status,
    created_at
) VALUES 
(
    'Sample Job Listing - Software Developer',
    'This is a sample job listing for Google Play reviewers to test the app functionality. Full-time position in Addis Ababa.',
    (SELECT id FROM categories WHERE name = 'Jobs' LIMIT 1),
    50000,
    'Addis Ababa, Ethiopia',
    'Addis Ababa',
    'USER_ID_HERE', -- Replace with actual user ID
    'approved',
    NOW()
),
(
    'Sample Home Listing - 2BR Apartment',
    'This is a sample home listing for testing purposes. Beautiful 2-bedroom apartment in Bole.',
    (SELECT id FROM categories WHERE name = 'Homes' LIMIT 1),
    3500000,
    'Bole, Addis Ababa',
    'Addis Ababa',
    'USER_ID_HERE', -- Replace with actual user ID
    'approved',
    NOW()
),
(
    'Sample Car Listing - Toyota Corolla 2020',
    'This is a sample car listing for testing. Well-maintained Toyota Corolla.',
    (SELECT id FROM categories WHERE name = 'Cars' LIMIT 1),
    850000,
    'Addis Ababa',
    'Addis Ababa',
    'USER_ID_HERE', -- Replace with actual user ID
    'approved',
    NOW()
);

-- Verify the account was created
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.verified,
    p.is_active,
    p.created_at
FROM profiles p
WHERE p.email = 'playstore.reviewer@yesrasewsolution.com';

-- Check if listings were created
SELECT 
    l.id,
    l.title,
    l.category_id,
    l.status,
    l.created_at
FROM listings l
WHERE l.author_id = 'USER_ID_HERE'; -- Replace with actual user ID
