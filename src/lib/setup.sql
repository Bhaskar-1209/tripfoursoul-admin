-- Database: tripforsoul-admin

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (password: admin123)
INSERT INTO admins (username, email, password) VALUES 
('admin', 'admin@tripforsoul.com', '$2a$10$8KzQMGx5C5Kc5Q5Q5Q5Q5u5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q')
ON DUPLICATE KEY UPDATE id=id;

-- Banner settings
CREATE TABLE IF NOT EXISTS banner_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  heading VARCHAR(255) DEFAULT 'Journeys Crafted for the Soul',
  subtitle TEXT DEFAULT 'Not just another trip. We design meaningful land journeys that connect you with culture, people, and places beyond the tourist trail.',
  button1_text VARCHAR(100) DEFAULT 'Find Now',
  button2_text VARCHAR(100) DEFAULT 'View All Trips',
  button2_link VARCHAR(255) DEFAULT '/destinations',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO banner_settings (heading, subtitle) VALUES 
('Journeys Crafted for the Soul', 'Not just another trip. We design meaningful land journeys that connect you with culture, people, and places beyond the tourist trail.')
ON DUPLICATE KEY UPDATE id=id;

-- Banner images
CREATE TABLE IF NOT EXISTS banner_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trending section control
CREATE TABLE IF NOT EXISTS trending_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  is_enabled TINYINT(1) DEFAULT 1,
  heading VARCHAR(255) DEFAULT 'Trending Now',
  subtitle TEXT DEFAULT 'Most sought-after destinations this season',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO trending_settings (is_enabled, heading, subtitle) VALUES 
(1, 'Trending Now', 'Most sought-after destinations this season')
ON DUPLICATE KEY UPDATE id=id;

-- Trending items
CREATE TABLE IF NOT EXISTS trending_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  region VARCHAR(100) DEFAULT '',
  price VARCHAR(50) DEFAULT '',
  badge VARCHAR(100) DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Region pricing
CREATE TABLE IF NOT EXISTS region_pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  region VARCHAR(100) NOT NULL UNIQUE,
  starting_price VARCHAR(50) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  is_active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO region_pricing (region, starting_price, currency) VALUES
('Asia', '$799', 'USD'),
('Europe', '$1,499', 'USD'),
('Middle East', '$999', 'USD'),
('Africa', '$1,299', 'USD'),
('Americas', '$1,199', 'USD')
ON DUPLICATE KEY UPDATE id=id;

-- Popular destinations
CREATE TABLE IF NOT EXISTS popular_destinations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  region VARCHAR(100) DEFAULT '',
  price VARCHAR(50) DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Homepage sections
CREATE TABLE IF NOT EXISTS homepage_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL UNIQUE,
  section_name VARCHAR(255) NOT NULL,
  is_visible TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO homepage_sections (section_key, section_name, sort_order) VALUES
('banner', 'Banner', 1),
('about_us', 'About Us', 2),
('trending', 'Trending Now', 3),
('popular_destinations', 'Popular Destinations', 4),
('spiritual_escape', 'Spiritual Escape', 5),
('features', 'Features', 6),
  ('testimonials', 'Testimonials', 7),
  ('gallery', 'Gallery', 8),
  ('deals', 'Deals', 9),
  ('footer', 'Footer', 10)
  ON DUPLICATE KEY UPDATE id=id;

  -- Deals section
  CREATE TABLE IF NOT EXISTS deals_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tagline VARCHAR(255) DEFAULT 'Travel offers',
    heading VARCHAR(255) DEFAULT 'Make more of every journey.',
    description TEXT DEFAULT 'Discover current seasonal offers and speak with our team to find the journey that suits your plans.',
    button_text VARCHAR(100) DEFAULT 'Ask about offers',
    button_link VARCHAR(255) DEFAULT '/contact?subject=Offer%20enquiry',
    card_tagline VARCHAR(255) DEFAULT 'Planning made personal',
    card_heading TEXT DEFAULT 'Get a tailored recommendation, clear inclusions, and expert support before you book.',
    card_description TEXT DEFAULT 'Offer availability and final pricing are confirmed by the travel team.',
    is_active TINYINT(1) DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

  INSERT INTO deals_settings (tagline, heading, description, button_text, button_link, card_tagline, card_heading, card_description, is_active) VALUES
  ('Travel offers', 'Make more of every journey.', 'Discover current seasonal offers and speak with our team to find the journey that suits your plans.', 'Ask about offers', '/contact?subject=Offer%20enquiry', 'Planning made personal', 'Get a tailored recommendation, clear inclusions, and expert support before you book.', 'Offer availability and final pricing are confirmed by the travel team.', 1)
  ON DUPLICATE KEY UPDATE id=id;

-- Blog posts table
CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content LONGTEXT,
  cover_image VARCHAR(500) DEFAULT '',
  author VARCHAR(255) DEFAULT '',
  tags JSON,
  meta_title VARCHAR(255) DEFAULT '',
  meta_description TEXT DEFAULT '',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Trips/Packages table
CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  price VARCHAR(50) NOT NULL,
  duration VARCHAR(100) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  category VARCHAR(100) DEFAULT 'general',
  badge VARCHAR(100) DEFAULT '',
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- About Us section
CREATE TABLE IF NOT EXISTS about_us (
  id INT AUTO_INCREMENT PRIMARY KEY,
  heading VARCHAR(255) DEFAULT 'Travel that Touches the Soul',
  subheading TEXT DEFAULT 'Curated Travel. Authentic Moments. Lasting Impact.',
  description TEXT DEFAULT 'At Trip For Soul, we craft meaningful land journeys that are soulful, sustainable, and deeply personal.',
  features TEXT,
  cta_text VARCHAR(255) DEFAULT 'Begin Your Journey',
  cta_link VARCHAR(255) DEFAULT '/enquire-now',
  image_url VARCHAR(500) DEFAULT '',
  is_active TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO about_us (heading, subheading, description) VALUES 
('Travel that Touches the Soul', 'Curated Travel. Authentic Moments. Lasting Impact.', 'At Trip For Soul, we craft meaningful land journeys that are soulful, sustainable, and deeply personal.')
ON DUPLICATE KEY UPDATE id=id;

-- Features section
CREATE TABLE IF NOT EXISTS features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  icon VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO features (icon, title, description, sort_order) VALUES
('best-price', 'Best Price Guarantee', 'We ensure you get the most value for your journey with competitive pricing on every package.', 1),
('easy-booking', 'Easy & Quick Booking', 'Book your dream trips in minutes with our simple and hassle-free booking system.', 2),
('support', 'Customer Care 24/7', 'Our dedicated support team is available around the clock to ensure a seamless travel experience.', 3)
ON DUPLICATE KEY UPDATE id=id;

-- Testimonials section
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) DEFAULT '',
  rating INT DEFAULT 5,
  review TEXT NOT NULL,
  video_url VARCHAR(500) DEFAULT '',
  influencer_video_url VARCHAR(500) DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO testimonials (name, image_url, rating, review, sort_order) VALUES
('Mr. Ritik Singh', 'https://tripforsoul.com/public/img/gallery/b-4.png', 5, 'We booked a 12-day tour of Italy with TripForSoul and had an absolutely remarkable experience. The itinerary was perfectly balanced — Florence, Rome, and Venice plus countryside in Tuscany. The hotels were very comfortable, the guides knowledgeable, and the logistics seamless. Highly recommend for anyone wanting to see the real Italy.', 1),
('Sohan Sharma', 'https://tripforsoul.com/public/img/gallery/b-1.png', 5, 'We booked Vietnam with TripForSoul. It was so much enchanting. From the moment we landed in Hanoi to the cruise in Ha Long Bay, everything was organised to perfection.', 2),
('Rakesh Singh', 'https://tripforsoul.com/public/img/gallery/b-2.png', 5, 'Europe package (Paris, Amsterdam, Barcelona) was a dream, with TripForSoul. Hotels: well-situated and clean. Tours: insightful. The small touch-ups (local restaurant recommendations, optional side-trips) made it feel bespoke rather than just a "standard package." Worth every penny.', 3),
('Vishnu Kumar', 'https://tripforsoul.com/public/img/gallery/b-3.png', 5, 'Our UK tour was absolutely unforgettable. From the busy streets of London to the serene landscapes of the Cotswolds, everything was organised flawlessly. The coach was clean and comfortable, accommodations exceeded expectations. Thanks tripforsoul. Highly recommend them for holidays.', 4)
ON DUPLICATE KEY UPDATE id=id;
