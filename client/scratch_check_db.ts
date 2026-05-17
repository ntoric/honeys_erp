import { db } from './src/lib/db';

async function checkAdmin() {
  try {
    const users = await db.users.toArray();
    console.log('All Users:', JSON.stringify(users, null, 2));
    
    const ntoric = await db.users.where('username').equals('ntoric').first();
    console.log('Query ntoric:', ntoric);
    
    const adminById = await db.users.get('user-admin');
    console.log('Admin by ID:', adminById);
  } catch (err) {
    console.error('Error checking admin:', err);
  }
}

checkAdmin();
