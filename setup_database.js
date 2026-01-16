const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupDatabase() {
    let connection;

    try {
        // Connexion à MySQL
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'school_management_system',
            port: 3306
        });

        console.log('✅ Connexion à la base de données réussie');

        // Lire le fichier SQL
        const sqlContent = fs.readFileSync('create_tables.sql', 'utf8');

        // Séparer les requêtes SQL (par point-virgule)
        const queries = sqlContent.split(';').filter(query => query.trim().length > 0);

        // Exécuter chaque requête
        for (const query of queries) {
            if (query.trim()) {
                await connection.execute(query.trim());
                console.log('✅ Requête exécutée:', query.trim().substring(0, 50) + '...');
            }
        }

        console.log('🎉 Base de données configurée avec succès !');
        console.log('📊 Tables créées avec des données de test');
        console.log('🔗 Vous pouvez maintenant accéder à http://localhost:3000/admin/enrolement/payement');

    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error.message);

        // Si la base n'existe pas, essayer de la créer
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('📝 Tentative de création de la base de données...');

            try {
                const rootConnection = await mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: '',
                    port: 3306
                });

                await rootConnection.execute('CREATE DATABASE IF NOT EXISTS school_management_system');
                await rootConnection.end();

                console.log('✅ Base de données créée, veuillez relancer le script');
            } catch (dbError) {
                console.error('❌ Impossible de créer la base de données:', dbError.message);
            }
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();