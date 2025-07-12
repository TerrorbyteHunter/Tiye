import bcrypt from 'bcryptjs';

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    
    console.log('Password:', password);
    console.log('Bcrypt Hash:', hash);
    console.log('\nSQL INSERT statement:');
    console.log(`INSERT INTO users (username, password, email, full_name, role, active) VALUES ('admin', '${hash}', 'admin@tiyende.com', 'System Administrator', 'admin', true);`);
}); 