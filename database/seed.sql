USE campusfind_db;

-- BCrypt hash for 'password123': $2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG
-- BCrypt hash for 'Admin@123': $2a$10$GZt6.6Gf5W7jZfZw7YyKLe0Ua6U6e0PkW14k88w6eY9Jv6cKxGvyG

INSERT INTO users (id, name, email, password, phone, role, avatar_url, status)
VALUES 
(1, 'Admin User', 'admin@campusfind.edu', '$2a$10$GZt6.6Gf5W7jZfZw7YyKLe0Ua6U6e0PkW14k88w6eY9Jv6cKxGvyG', '+1 555-0199', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'ACTIVE'),
(2, 'Alex Johnson', 'alex@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', '+1 555-0101', 'USER', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'ACTIVE'),
(3, 'Sarah Connor', 'sarah@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', '+1 555-0102', 'USER', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'ACTIVE'),
(4, 'David Miller', 'david@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', '+1 555-0103', 'USER', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO items (id, type, title, category, brand, model, color, description, date_lost_or_found, approximate_time, location, latitude, longitude, additional_details, reward, image_url, status, moderation_status, user_id)
VALUES
(1, 'LOST', 'Midnight Blue iPhone 15 Pro', 'Mobile Phones', 'Apple', 'iPhone 15 Pro 256GB', 'Blue Titanium', 'Lost my iPhone 15 Pro near Central Library. It has a matte black Spigen case and a small scratch near the charging port.', '2026-09-28', '14:30', 'Central Library, 2nd Floor Study Hall', 40.758896, -73.985130, 'Lock screen wallpaper is a golden retriever puppy. Serial ends in 98X1.', 100.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'ACTIVE', 'APPROVED', 2),

(2, 'FOUND', 'Blue iPhone in Rugged Case', 'Mobile Phones', 'Apple', 'iPhone 15 Pro', 'Blue', 'Found an iPhone with dark titanium finish sitting on a study desk on the second floor of the public library.', '2026-09-28', '16:00', 'Central Library, Reading Lounge', 40.758950, -73.985200, 'Handed over to the front helpdesk security box. Screen locked.', 0.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'ACTIVE', 'APPROVED', 3),

(3, 'LOST', 'Leather Bi-Fold Wallet', 'Wallets', 'Bellroy', 'Hide & Seek', 'Brown', 'Lost my brown leather wallet containing driving license, student ID card, and metro pass.', '2026-09-29', '09:15', 'Grand Central Station Platform 4', 40.752726, -73.977229, 'Has initials AJ stamped subtly on inner fold.', 50.00, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', 'ACTIVE', 'APPROVED', 2),

(4, 'FOUND', 'Brown Leather Wallet with Cards', 'Wallets', 'Bellroy', 'Bi-Fold', 'Brown', 'Found a genuine leather wallet dropped near ticket vending machine.', '2026-09-29', '10:00', 'Grand Central Terminal near 42nd St exit', 40.752800, -73.977300, 'Contains student ID and transit cards. Please verify full name on cards.', 0.00, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', 'ACTIVE', 'APPROVED', 4),

(5, 'LOST', 'MacBook Air M2 Silver', 'Laptops', 'Apple', 'MacBook Air 13-inch', 'Silver', 'Left in an orange felt sleeve at Coffee Corner cafe.', '2026-09-27', '18:00', 'Coffee Corner, 5th Avenue', 40.773998, -73.966000, 'Has sticker with React logo and NASA emblem on top lid.', 200.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'ACTIVE', 'APPROVED', 3),

(6, 'FOUND', 'Silver MacBook Air in Sleeve', 'Laptops', 'Apple', 'MacBook Air', 'Silver', 'Found laptop in sleeve left behind at corner table.', '2026-09-27', '19:30', '5th Ave Cafe, Corner Table', 40.774050, -73.966050, 'Kept safely with cafe manager.', 0.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'ACTIVE', 'APPROVED', 4),

(7, 'LOST', 'Car Keys with Blue Toyota Lanyard', 'Keys', 'Toyota', 'Smart Key Fob', 'Black / Blue', 'Lost set of keys with electronic fob and gym locker tag.', '2026-09-30', '12:00', 'Riverside Park Jogging Trail', 40.800000, -73.970000, 'Contains one brass door key and silver bottle opener.', 30.00, 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500', 'ACTIVE', 'APPROVED', 2),

(8, 'FOUND', 'Black Toyota Key Fob', 'Keys', 'Toyota', 'Key Fob', 'Black', 'Found car key fob on park bench along the river path.', '2026-09-30', '13:15', 'Riverside Park Bench 12', 40.800100, -73.970100, 'Blue fabric strap attached.', 0.00, 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500', 'ACTIVE', 'APPROVED', 3)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Sample potential matches
INSERT INTO matches (id, lost_item_id, found_item_id, match_score, match_reasons, status)
VALUES
(1, 1, 2, 94, 'Matching Category (Mobile Phones), Matching Brand (Apple), Same Model (iPhone 15 Pro), Matching Location (Central Library, within 100m), Matching Date (2026-09-28)', 'PENDING'),
(2, 3, 4, 91, 'Matching Category (Wallets), Matching Brand (Bellroy), Matching Color (Brown), Matching Location (Grand Central Terminal, within 150m), Matching Date (2026-09-29)', 'PENDING'),
(3, 5, 6, 88, 'Matching Category (Laptops), Matching Brand (Apple), Same Model (MacBook Air), Matching Location (5th Ave Cafe), Matching Date (2026-09-27)', 'PENDING'),
(4, 7, 8, 92, 'Matching Category (Keys), Matching Brand (Toyota), Matching Location (Riverside Park), Matching Date (2026-09-30)', 'PENDING')
ON DUPLICATE KEY UPDATE match_score=VALUES(match_score);

-- Sample notification
INSERT INTO notifications (id, user_id, title, message, type, link, is_read)
VALUES
(1, 2, 'Potential Match Found!', 'We found a 94% match for your lost iPhone 15 Pro at Central Library.', 'MATCH_ALERT', '/matches', false),
(2, 2, 'Potential Match Found!', 'We found a 91% match for your lost Bellroy Wallet at Grand Central.', 'MATCH_ALERT', '/matches', false),
(3, 3, 'Potential Match Found!', 'We found an 88% match for your lost MacBook Air at Coffee Corner.', 'MATCH_ALERT', '/matches', false)
ON DUPLICATE KEY UPDATE title=VALUES(title);
