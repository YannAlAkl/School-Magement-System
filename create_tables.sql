-- Créer la table enrolements
CREATE TABLE IF NOT EXISTS enrolements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    student_username VARCHAR(255) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    enroll_status VARCHAR(50) DEFAULT 'pending',
    enroll_date DATETIME
);

-- Créer la table payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_username VARCHAR(255) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    payment_date DATETIME,
    status VARCHAR(50) DEFAULT 'pending',
    reference VARCHAR(255),
    note TEXT
);

-- Insérer des données de test pour les enrolements
INSERT INTO enrolements (student_id, student_username, course_title, enroll_status, enroll_date) VALUES
(1, 'john_doe', 'Mathématiques', 'approved', '2024-01-15'),
(2, 'jane_smith', 'Physique', 'pending', '2024-01-20'),
(3, 'bob_johnson', 'Chimie', 'approved', '2024-01-10');

-- Insérer des données de test pour les payments
INSERT INTO payments (student_username, course_title, amount, currency, method, payment_date, status, reference) VALUES
('john_doe', 'Mathématiques', 150.00, 'USD', 'credit_card', '2024-01-15', 'completed', 'PAY-001'),
('jane_smith', 'Physique', 200.00, 'USD', 'paypal', '2024-01-20', 'pending', 'PAY-002'),
('bob_johnson', 'Chimie', 175.50, 'USD', 'bank_transfer', '2024-01-10', 'completed', 'PAY-003');