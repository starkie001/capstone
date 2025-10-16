/**
 * Test MongoDB Connection
 * 
 * Simple script to verify MongoDB connection is working
 * Usage: npm run db:test
 */

import dbConnect from './dbConfig.js';
import User from './models/User.js';
import Booking from './models/Booking.js';
import Availability from './models/Availability.js';
import Settings from './models/Settings.js';

async function testConnection() {
    try {
        console.log('🔌 Testing MongoDB connection...\n');
        
        // Test connection
        await dbConnect();
        console.log('✅ Successfully connected to MongoDB!\n');
        
        // Test models
        console.log('📋 Testing models...');
        
        // Get counts
        const userCount = await User.countDocuments();
        const bookingCount = await Booking.countDocuments();
        const availabilityCount = await Availability.countDocuments();
        const settingsCount = await Settings.countDocuments();
        
        console.log(`\n📊 Database Statistics:`);
        console.log(`   Users: ${userCount}`);
        console.log(`   Bookings: ${bookingCount}`);
        console.log(`   Availabilities: ${availabilityCount}`);
        console.log(`   Settings: ${settingsCount}`);
        
        console.log('\n✨ All tests passed!');
        console.log('\n👉 Next step: Run the migration script if you haven\'t already:');
        console.log('   node src/lib/migrate-to-mongodb.js\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Connection test failed:', error.message);
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Check that MONGODB_URI is set in .env.local');
        console.error('   2. Verify MongoDB is running (if local)');
        console.error('   3. Check your connection string format');
        console.error('\n   Example: MONGODB_URI=mongodb://localhost:27017/npas\n');
        process.exit(1);
    }
}

testConnection();
