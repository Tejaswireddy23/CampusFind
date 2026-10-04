-- ========================================================
-- CampusFind Production Master Seed Data
-- Required initial master data ONLY: Campus Locations & Item Categories
-- NOTE: Does NOT insert dummy student accounts or fake reports.
-- ========================================================

USE campusfind_db;

-- 1. Master Campus Locations (14 Predefined Zones)
INSERT INTO campus_locations (name, code, zone, description, is_active)
VALUES
  ('Main Gate', 'MG', 'Entrance Zone', 'Campus primary security gate and visitor entry booth', TRUE),
  ('Library', 'LIB', 'Academic Zone', 'Central campus library, digital study rooms and reading halls', TRUE),
  ('Canteen', 'CAN', 'Central Zone', 'Campus cafeteria, food courts and open dining pavilion', TRUE),
  ('Academic Block', 'AB', 'Academic Zone', 'Classrooms, lecture theatres and faculty staffrooms', TRUE),
  ('Computer Block', 'CB', 'Tech Zone', 'Computer science labs, high-performance computing centers', TRUE),
  ('Laboratory', 'LAB', 'Science Zone', 'Physics, Chemistry, and specialized engineering laboratories', TRUE),
  ('Seminar Hall', 'SH', 'Central Zone', 'Air-conditioned conference room and symposium venue', TRUE),
  ('Auditorium', 'AUD', 'Cultural Zone', 'Main college indoor auditorium and cultural center', TRUE),
  ('Playground', 'PG', 'Sports Zone', 'Athletics track, cricket/football grounds and basketball court', TRUE),
  ('Parking Area', 'PKG', 'Peripheral Zone', 'Student and staff vehicle parking bays', TRUE),
  ('Hostel', 'HST', 'Residential Zone', 'Campus student dormitories, dining mess and common rooms', TRUE),
  ('Bus Area', 'BUS', 'Transport Zone', 'College transport terminal and boarding bays', TRUE),
  ('Administrative Block', 'ADM', 'Admin Zone', 'Principal office, accounts, admissions and student welfare', TRUE),
  ('Other Campus Area', 'OTH', 'General Zone', 'Walkways, garden pavilions, corridors and common lounges', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- 2. Master Item Categories (14 Categories)
INSERT INTO categories (name, icon, description, is_active)
VALUES
  ('ID Card', 'CreditCard', 'Student college identification cards, library cards, and access badges', TRUE),
  ('Mobile Phone', 'Smartphone', 'Smartphones, feature phones, cases, and SIM accessories', TRUE),
  ('Laptop', 'Laptop', 'Laptops, MacBooks, tablets, and power adapter chargers', TRUE),
  ('Wallet', 'Wallet', 'Wallets, cardholders, money pouches, and purses', TRUE),
  ('Bag', 'Briefcase', 'College backpacks, laptop bags, tote bags, and sports duffels', TRUE),
  ('Keys', 'Key', 'Room keys, hostel keys, vehicle keys, bike keys, and locker keys', TRUE),
  ('Books', 'BookOpen', 'Textbooks, notebooks, lab manuals, syllabus files, and library books', TRUE),
  ('Calculator', 'Calculator', 'Scientific calculators, engineering calculators, and math instruments', TRUE),
  ('Documents', 'FileText', 'Official certificates, mark sheets, admit cards, and project reports', TRUE),
  ('Electronics', 'Headphones', 'Wireless earbuds, smartwatches, power banks, and USB drives', TRUE),
  ('Jewelry', 'Watch', 'Wristwatches, fitness trackers, rings, and chains', TRUE),
  ('Clothing', 'Shirt', 'Jackets, college hoodies, lab coats, aprons, and umbrellas', TRUE),
  ('Accessories', 'Glasses', 'Eyeglasses, sunglasses, water bottles, and stationery pouches', TRUE),
  ('Other', 'HelpCircle', 'Uncategorized personal belongings found across campus', TRUE)
ON DUPLICATE KEY UPDATE name=name;
