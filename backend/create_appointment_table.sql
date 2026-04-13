-- Create the appointment table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  appointment_date DATE,
  appointment_time TIME,
  type VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id)
);