-- FuelQ Database Schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fuelq_db;
USE fuelq_db;

-- Threads table for forum discussions
CREATE TABLE IF NOT EXISTS threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  date BIGINT NOT NULL,
  category VARCHAR(50) NOT NULL,
  views INT DEFAULT 0,
  content TEXT NOT NULL
);

-- Comments table for thread replies
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  author VARCHAR(100) NOT NULL,
  date BIGINT NOT NULL,
  content TEXT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  newsletter BOOLEAN DEFAULT FALSE,
  date BIGINT NOT NULL
);

-- Users table for authentication (if needed in the future)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('admin', 'moderator', 'user') DEFAULT 'user',
  dateJoined BIGINT NOT NULL,
  lastLogin BIGINT
);

-- Insert sample data for testing
INSERT INTO threads (title, author, date, category, views, content) VALUES
('Latest developments in hydrogen fuel cell efficiency', 'Dr. Elena Rodriguez', 1684138200000, 'hydrogen', 245, 'I wanted to share some exciting research from our lab on improving PEM fuel cell efficiency. We\'ve achieved a 12% improvement in energy conversion through novel catalyst materials. The key was using a graphene-supported platinum alloy that reduces catalyst poisoning while maintaining conductivity.'),
('Biofuels from algae: Scaling production challenges', 'Prof. James Chen', 1684224600000, 'biofuels', 189, 'Our team has been working on optimizing algae growth for biofuel production. We\'ve developed a new photobioreactor design that increases productivity by 35% while reducing water usage. The main challenge remains harvesting cost-effectively at scale.'),
('Geothermal energy in cold climates', 'Sarah Kim', 1684311000000, 'geothermal', 156, 'Has anyone worked on geothermal systems in colder climates? We\'re planning a community heating project in Alaska and wondering about efficiency concerns when ground temperatures are lower.');

INSERT INTO comments (thread_id, author, date, content) VALUES
(1, 'Prof. James Chen', 1684156920000, 'Fascinating results, Dr. Rodriguez! Could you share more details about graphene support structure? We\'ve been working on similar approaches but haven\'t achieved comparable efficiency gains.'),
(1, 'Sarah Kim', 1684243320000, 'This is very promising for transportation applications. Have you tested these under real-world temperature and pressure conditions?'),
(2, 'Dr. Elena Rodriguez', 1684239720000, 'Great work, Prof. Chen! We\'ve experimented with membrane filtration for harvesting, which reduces energy costs by about 40% compared to centrifugation. Have you considered this approach?'),
(3, 'Prof. James Chen', 1684326120000, 'Yes, we\'ve implemented several geothermal systems in Alaska. The key is using antifreeze solutions in the ground loop and ensuring proper insulation. We typically see a 15-20% efficiency reduction compared to temperate climates, but the systems remain economically viable.');
