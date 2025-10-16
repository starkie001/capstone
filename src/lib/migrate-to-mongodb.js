/**
 * Migration Script: JSON to MongoDB
 * 
 * This script migrates existing data from JSON files to MongoDB
 * Run this once after setting up your MongoDB connection
 * 
 * Usage: npm run db:migrate
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dbConnect from './dbConfig.js';
import User from './models/User.js';
import Booking from './models/Booking.js';
import Availability from './models/Availability.js';
import Settings from './models/Settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrateUsers() {
    console.log('\n🔄 Migrating users...');
    try {
        const usersData = await readFile(
            path.join(__dirname, 'dao', 'users-db.json'),
            'utf-8'
        );
        const users = JSON.parse(usersData);
        
        // Clear existing users (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        
        for (const user of users) {
            // Check if user already exists by email
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                console.log(`⏭️  User already exists: ${user.email}`);
                continue;
            }
            
            await User.create({
                name: user.name,
                email: user.email,
                password: user.password,
                image: user.image,
                role: user.role,
                status: user.status,
                createdAt: user.dateCreated,
                updatedAt: user.dateUpdated
            });
            console.log(`✅ Migrated user: ${user.email}`);
        }
        
        console.log('✨ Users migration completed!');
    } catch (error) {
        console.error('❌ Error migrating users:', error.message);
    }
}

async function migrateBookings() {
    console.log('\n🔄 Migrating bookings...');
    try {
        const bookingsData = await readFile(
            path.join(__dirname, 'dao', 'bookings.json'),
            'utf-8'
        );
        const bookings = JSON.parse(bookingsData);
        
        // Clear existing bookings (optional - comment out if you want to keep existing data)
        // await Booking.deleteMany({});
        
        for (const booking of bookings) {
            // Check if booking already exists
            const existingBooking = await Booking.findOne({ 
                userId: booking.userId,
                date: booking.date,
                groupName: booking.groupName
            });
            
            if (existingBooking) {
                console.log(`⏭️  Booking already exists: ${booking.groupName} on ${booking.date}`);
                continue;
            }
            
            await Booking.create({
                userId: booking.userId,
                role: booking.role,
                groupName: booking.groupName,
                groupType: booking.groupType,
                groupSize: booking.groupSize,
                interests: booking.interests,
                otherInfo: booking.otherInfo,
                date: booking.date,
                status: booking.status,
                created: booking.created
            });
            console.log(`✅ Migrated booking: ${booking.groupName} on ${booking.date}`);
        }
        
        console.log('✨ Bookings migration completed!');
    } catch (error) {
        console.error('❌ Error migrating bookings:', error.message);
    }
}

async function migrateObsAvailability() {
    console.log('\n🔄 Migrating observatory availability...');
    try {
        const obsData = await readFile(
            path.join(__dirname, 'dao', 'obs-availability.json'),
            'utf-8'
        );
        const { openDates } = JSON.parse(obsData);
        
        if (!openDates || openDates.length === 0) {
            console.log('⏭️  No observatory availability to migrate');
            return;
        }
        
        // Check if already exists
        const existing = await Availability.findOne({ type: 'obs', userId: 'system' });
        if (existing) {
            console.log('⏭️  Observatory availability already exists, updating...');
            await Availability.findByIdAndUpdate(existing._id, { dates: openDates });
        } else {
            await Availability.create({
                type: 'obs',
                userId: 'system',
                dates: openDates,
                role: 'admin'
            });
        }
        
        console.log(`✅ Migrated ${openDates.length} observatory open dates`);
        console.log('✨ Observatory availability migration completed!');
    } catch (error) {
        console.error('❌ Error migrating observatory availability:', error.message);
    }
}

async function migrateObsSettings() {
    console.log('\n🔄 Migrating observatory settings...');
    try {
        const settingsData = await readFile(
            path.join(__dirname, 'dao', 'obs-availability-settings.json'),
            'utf-8'
        );
        const settings = JSON.parse(settingsData);
        
        // Check if already exists
        const existing = await Settings.findOne({ key: 'obs-availability-settings' });
        if (existing) {
            console.log('⏭️  Observatory settings already exist, updating...');
            await Settings.findByIdAndUpdate(existing._id, { 
                value: settings,
                description: 'Observatory availability settings including bookings status and requirements'
            });
        } else {
            await Settings.create({
                key: 'obs-availability-settings',
                value: settings,
                description: 'Observatory availability settings including bookings status and requirements'
            });
        }
        
        console.log(`✅ Migrated observatory settings (bookingsActive: ${settings.bookingsActive}, ${settings.requirements?.length || 0} requirements)`);
        console.log('✨ Observatory settings migration completed!');
    } catch (error) {
        console.error('❌ Error migrating observatory settings:', error.message);
    }
}

async function migrateHostingAvailability() {
    console.log('\n🔄 Migrating hosting availability...');
    try {
        const hostingData = await readFile(
            path.join(__dirname, 'dao', 'hosting-availability.json'),
            'utf-8'
        );
        const hostingByUser = JSON.parse(hostingData);
        
        let migratedCount = 0;
        for (const [userId, availabilityData] of Object.entries(hostingByUser)) {
            // Check if already exists
            const existing = await Availability.findOne({ type: 'hosting', userId });
            if (existing) {
                console.log(`⏭️  Hosting availability for user ${userId} already exists`);
                continue;
            }
            
            await Availability.create({
                type: 'hosting',
                userId,
                dates: availabilityData.dates || [],
                role: 'member' // Default role
            });
            
            console.log(`✅ Migrated hosting availability for user ${userId} (${availabilityData.dates?.length || 0} dates)`);
            migratedCount++;
        }
        
        console.log(`✨ Hosting availability migration completed! (${migratedCount} users)`);
    } catch (error) {
        console.error('❌ Error migrating hosting availability:', error.message);
    }
}

async function runMigration() {
    try {
        console.log('🚀 Starting MongoDB migration...\n');
        console.log('📋 Make sure your MONGODB_URI is set in .env.local\n');
        
        // Connect to MongoDB
        await dbConnect();
        console.log('✅ Connected to MongoDB\n');
        
        // Run migrations
        await migrateUsers();
        await migrateBookings();
        await migrateObsAvailability();
        await migrateObsSettings();
        await migrateHostingAvailability();
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Verify your data in MongoDB');
        console.log('   2. Test your application endpoints');
        console.log('   3. Check that all features work:');
        console.log('      - User authentication');
        console.log('      - Bookings creation/viewing');
        console.log('      - Observatory availability');
        console.log('      - Hosting availability');
        console.log('      - Settings/requirements');
        console.log('   4. Once confirmed, you can safely backup and remove the JSON files');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run the migration
runMigration();
