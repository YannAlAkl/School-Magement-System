const mysql = require('mysql2/promise');

async function fixPaymentsTable() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'school_management_system',
            port: 3306
        });

        console.log('✅ Connexion réussie');

        // Vérifier si la table payments existe et sa structure
        const [tables] = await connection.execute("SHOW TABLES LIKE 'payments'");
        if (tables.length > 0) {
            console.log('🗑️ Suppression de l\'ancienne table payments...');
            await connection.execute('DROP TABLE payments');
        }

        console.log('📝 Création de la nouvelle table payments...');
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

        console.log('📝 Insertion des données de test...');
        await connection.execute(`
            INSERT INTO payments (student_username, course_title, amount, currency, method, payment_date, status, reference) VALUES
            ('john_doe', 'Mathématiques', 150.00, 'USD', 'credit_card', '2024-01-15', 'completed', 'PAY-001'),
            ('jane_smith', 'Physique', 200.00, 'USD', 'paypal', '2024-01-20', 'pending', 'PAY-002'),
            ('bob_johnson', 'Chimie', 175.50, 'USD', 'bank_transfer', '2024-01-10', 'completed', 'PAY-003')
        `);

        console.log('✅ Table payments créée et remplie avec succès !');

        // Vérifier les résultats
        const [enrollmentCount] = await connection.execute('SELECT COUNT(*) as count FROM enrolements');
        const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payments');

        console.log(`📊 Total enrôlements: ${enrollmentCount[0].count}`);
        console.log(`📊 Total paiements: ${paymentCount[0].count}`);

        console.log('🎉 Prêt ! Visitez http://localhost:3000/admin/enrolement/payement');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixPaymentsTable();