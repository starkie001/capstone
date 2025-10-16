import dbConnect from '../dbConfig.js';
import Settings from '../models/Settings.js';
import Availability from '../models/Availability.js';

export class SettingsDao {
    // Settings CRUD operations
    async getAllSettings() {
        await dbConnect();
        const settings = await Settings.find({}).lean();
        return settings.map(setting => ({
            ...setting,
            id: setting._id.toString(),
            _id: undefined
        }));
    }

    async getSettingByKey(key) {
        await dbConnect();
        const setting = await Settings.findOne({ key }).lean();
        if (!setting) return null;
        return {
            ...setting,
            id: setting._id.toString(),
            _id: undefined
        };
    }

    async createOrUpdateSetting(key, value, description = '') {
        await dbConnect();
        const setting = await Settings.findOneAndUpdate(
            { key },
            { key, value, description },
            { new: true, upsert: true, runValidators: true }
        ).lean();
        
        return {
            ...setting,
            id: setting._id.toString(),
            _id: undefined
        };
    }

    async deleteSetting(key) {
        await dbConnect();
        const setting = await Settings.findOneAndDelete({ key }).lean();
        if (!setting) return null;
        
        return {
            ...setting,
            id: setting._id.toString(),
            _id: undefined
        };
    }

    // Availability operations (for obs and hosting)
    async getAvailability(type, userId = null) {
        await dbConnect();
        const query = { type };
        if (userId) {
            query.userId = userId;
        }
        const availabilities = await Availability.find(query).lean();
        return availabilities.map(avail => ({
            ...avail,
            id: avail._id.toString(),
            _id: undefined
        }));
    }

    async createOrUpdateAvailability(type, userId, dates, role = null) {
        await dbConnect();
        const availability = await Availability.findOneAndUpdate(
            { type, userId },
            { type, userId, dates, role },
            { new: true, upsert: true, runValidators: true }
        ).lean();
        
        return {
            ...availability,
            id: availability._id.toString(),
            _id: undefined
        };
    }

    async deleteAvailability(type, userId) {
        await dbConnect();
        const availability = await Availability.findOneAndDelete({ type, userId }).lean();
        if (!availability) return null;
        
        return {
            ...availability,
            id: availability._id.toString(),
            _id: undefined
        };
    }

    async getAllAvailabilitiesByType(type) {
        await dbConnect();
        const availabilities = await Availability.find({ type }).lean();
        return availabilities.map(avail => ({
            ...avail,
            id: avail._id.toString(),
            _id: undefined
        }));
    }
}