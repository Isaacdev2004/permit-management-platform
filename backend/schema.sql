-- Create database
CREATE DATABASE IF NOT EXISTS permit_management;
USE permit_management;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  industry VARCHAR(255),
  automations INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permits table
CREATE TABLE IF NOT EXISTS permits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  permit_id VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  permit_type VARCHAR(255),
  work_class VARCHAR(255),
  issued_date DATE,
  applied_date DATE,
  zip_code VARCHAR(10),
  district VARCHAR(10),
  sqft VARCHAR(50),
  location TEXT,
  contractor VARCHAR(255),
  validation_amount VARCHAR(50),
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_permit_id (permit_id),
  INDEX idx_city (city),
  INDEX idx_issued_date (issued_date),
  INDEX idx_contractor (contractor),
  INDEX idx_work_class (work_class),
  FULLTEXT idx_location (location)
);

-- Filter presets table
CREATE TABLE IF NOT EXISTS filter_presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  filter_by VARCHAR(255),
  permit_type VARCHAR(255),
  work_class VARCHAR(255),
  contractor_category VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  client_id INT,
  frequency VARCHAR(50),
  permit_type VARCHAR(255),
  work_class VARCHAR(255),
  distribution_type VARCHAR(255),
  distribution_split VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP NULL,
  next_run TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Export history table
CREATE TABLE IF NOT EXISTS export_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  export_type VARCHAR(50),
  file_size VARCHAR(50),
  record_count INT,
  status ENUM('completed', 'processing', 'failed') DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO clients (company, email, industry, automations) VALUES
('BuildWell Commercial', 'bids@buildwell.com', 'Commercial Construction', 2),
('Reliable Renovators', 'contact@reliablerenovators.com', 'Residential Construction', 1),
('aaa', 'abhishek20040916@gmail.com', 'qq', 1);

INSERT INTO filter_presets (name, filter_by, permit_type, work_class, contractor_category) VALUES
('test1', 'Contractor Category', 'Electrical', 'Plumbing Service Line', 'Driveway');

INSERT INTO automations (name, client_id, frequency, permit_type, work_class, distribution_type, distribution_split, is_active) VALUES
('Abhishek', 3, 'Once', 'Any', 'Any', 'Round Robin', '26%', true);
