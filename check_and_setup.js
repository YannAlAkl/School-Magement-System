const mysql = require('mysql2/promise');

async function checkAndSetupDatabase() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'school_management_system',
            port: 3306
        });

        console.log('✅ Connexion à la base de données réussie');

        // Vérifier la structure de la table enrolements
        console.log('🔍 Vérification de la structure de la table enrolements...');
        const [columns] = await connection.execute('DESCRIBE enrolements');
        console.log('📋 Colonnes de enrolements:', columns.map(col => col.Field).join(', '));

        // Vérifier si la table payments existe
        const [tables] = await connection.execute("SHOW TABLES LIKE 'payments'");
        if (tables.length === 0) {
            console.log('📝 Création de la table payments...');
            await connection.execute(`
                CREATE TABLE payments (
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
                )
            `);
            console.log('✅ Table payments créée');
        }

        // Vérifier s'il y a des données dans enrolements
        const [enrollmentCount] = await connection.execute('SELECT COUNT(*) as count FROM enrolements');
        console.log(`📊 Nombre d'enrôlements: ${enrollmentCount[0].count}`);

        if (enrollmentCount[0].count === 0) {
            console.log('📝 Insertion de données de test pour enrolements...');
            // Adapter les données selon la structure existante
            if (columns.some(col => col.Field === 'student_username')) {
                await connection.execute(`
                    INSERT INTO enrolements (student_id, student_username, course_title, enroll_status, enroll_date) VALUES
                    (1, 'john_doe', 'Mathématiques', 'approved', '2024-01-15'),
                    (2, 'jane_smith', 'Physique', 'pending', '2024-01-20'),
                    (3, 'bob_johnson', 'Chimie', 'approved', '2024-01-10')
                `);
            } else {
                // Si pas de student_username, utiliser seulement student_id
                await connection.execute(`
                    INSERT INTO enrolements (student_id, course_title, enroll_status, enroll_date) VALUES
                    (1, 'Mathématiques', 'approved', '2024-01-15'),
                    (2, 'Physique', 'pending', '2024-01-20'),
                    (3, 'Chimie', 'approved', '2024-01-10')
                `);
            }
            console.log('✅ Données de test insérées dans enrolements');
        }

        // Vérifier et insérer des données dans payments
        const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payments');
        console.log(`📊 Nombre de paiements: ${paymentCount[0].count}`);

        if (paymentCount[0].count === 0) {
            console.log('📝 Insertion de données de test pour payments...');
            await connection.execute(`
                INSERT INTO payments (student_username, course_title, amount, currency, method, payment_date, status, reference) VALUES
                ('john_doe', 'Mathématiques', 150.00, 'USD', 'credit_card', '2024-01-15', 'completed', 'PAY-001'),
                ('jane_smith', 'Physique', 200.00, 'USD', 'paypal', '2024-01-20', 'pending', 'PAY-002'),
                ('bob_johnson', 'Chimie', 175.50, 'USD', 'bank_transfer', '2024-01-10', 'completed', 'PAY-003')
            `);
            console.log('✅ Données de test insérées dans payments');
        }

        console.log('🎉 Base de données configurée avec succès !');
        console.log('🔗 Vous pouvez maintenant accéder à http://localhost:3000/admin/enrolement/payement');
        console.log('👀 Les boutons Modifier/Supprimer devraient maintenant être visibles !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAndSetupDatabase();