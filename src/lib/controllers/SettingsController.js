import { SettingsDao } from '../dao/settingsDao.js';

export class SettingsController {
    constructor(settingsDao = new SettingsDao()) {
        this.settingsDao = settingsDao;
        console.log('[SettingsController] SettingsController initialized');
    }

    // Settings operations
    async getAllSettings() {
        try {
            console.log('[SettingsController] getAllSettings: Fetching all settings');
            const settings = await this.settingsDao.getAllSettings();
            console.log(`[SettingsController] getAllSettings: Found ${settings.length} settings`);
            return settings;
        } catch (error) {
            console.error('[SettingsController] getAllSettings: Error occurred', error);
            throw new Error(`Failed to get all settings: ${error.message}`);
        }
    }

    async getSettingByKey(key) {
        try {
            console.log(`[SettingsController] getSettingByKey: Fetching setting with key: ${key}`);
            const setting = await this.settingsDao.getSettingByKey(key);
            if (!setting) {
                console.log(`[SettingsController] getSettingByKey: Setting not found with key: ${key}`);
                return null;
            }
            console.log(`[SettingsController] getSettingByKey: Setting found with key: ${key}`);
            return setting;
        } catch (error) {
            console.error(`[SettingsController] getSettingByKey: Error occurred for key: ${key}`, error);
            throw new Error(`Failed to get setting by key: ${error.message}`);
        }
    }

    async createOrUpdateSetting(key, value, description = '') {
        try {
            console.log(`[SettingsController] createOrUpdateSetting: Creating/updating setting with key: ${key}`);
            
            if (!key) {
                console.error('[SettingsController] createOrUpdateSetting: Missing required key');
                throw new Error('Setting key is required');
            }

            const setting = await this.settingsDao.createOrUpdateSetting(key, value, description);
            console.log(`[SettingsController] createOrUpdateSetting: Setting created/updated successfully with key: ${key}`);
            return setting;
        } catch (error) {
            console.error(`[SettingsController] createOrUpdateSetting: Error for key: ${key}`, error);
            throw new Error(`Failed to create/update setting: ${error.message}`);
        }
    }

    async deleteSetting(key) {
        try {
            console.log(`[SettingsController] deleteSetting: Deleting setting with key: ${key}`);
            const deletedSetting = await this.settingsDao.deleteSetting(key);
            if (!deletedSetting) {
                console.log(`[SettingsController] deleteSetting: Setting not found with key: ${key}`);
                return null;
            }
            
            console.log(`[SettingsController] deleteSetting: Setting deleted successfully with key: ${key}`);
            return deletedSetting;
        } catch (error) {
            console.error(`[SettingsController] deleteSetting: Error deleting setting with key: ${key}`, error);
            throw new Error(`Failed to delete setting: ${error.message}`);
        }
    }

    // Availability operations
    async getAvailability(type, userId = null) {
        try {
            console.log(`[SettingsController] getAvailability: Fetching availability for type: ${type}, userId: ${userId}`);
            const availabilities = await this.settingsDao.getAvailability(type, userId);
            console.log(`[SettingsController] getAvailability: Found ${availabilities.length} availabilities`);
            return availabilities;
        } catch (error) {
            console.error(`[SettingsController] getAvailability: Error occurred for type: ${type}`, error);
            throw new Error(`Failed to get availability: ${error.message}`);
        }
    }

    async getAllAvailabilitiesByType(type) {
        try {
            console.log(`[SettingsController] getAllAvailabilitiesByType: Fetching all availabilities for type: ${type}`);
            const availabilities = await this.settingsDao.getAllAvailabilitiesByType(type);
            console.log(`[SettingsController] getAllAvailabilitiesByType: Found ${availabilities.length} availabilities`);
            return availabilities;
        } catch (error) {
            console.error(`[SettingsController] getAllAvailabilitiesByType: Error for type: ${type}`, error);
            throw new Error(`Failed to get availabilities by type: ${error.message}`);
        }
    }

    async createOrUpdateAvailability(type, userId, dates, role = null) {
        try {
            console.log(`[SettingsController] createOrUpdateAvailability: Creating/updating availability for type: ${type}, userId: ${userId}`);
            
            if (!type || !userId) {
                console.error('[SettingsController] createOrUpdateAvailability: Missing required fields');
                throw new Error('Type and userId are required');
            }

            if (!['hosting', 'obs'].includes(type)) {
                console.error(`[SettingsController] createOrUpdateAvailability: Invalid type: ${type}`);
                throw new Error('Invalid type. Must be hosting or obs');
            }

            const availability = await this.settingsDao.createOrUpdateAvailability(type, userId, dates, role);
            console.log(`[SettingsController] createOrUpdateAvailability: Availability created/updated successfully`);
            return availability;
        } catch (error) {
            console.error(`[SettingsController] createOrUpdateAvailability: Error for type: ${type}`, error);
            throw new Error(`Failed to create/update availability: ${error.message}`);
        }
    }

    async deleteAvailability(type, userId) {
        try {
            console.log(`[SettingsController] deleteAvailability: Deleting availability for type: ${type}, userId: ${userId}`);
            const deletedAvailability = await this.settingsDao.deleteAvailability(type, userId);
            if (!deletedAvailability) {
                console.log(`[SettingsController] deleteAvailability: Availability not found`);
                return null;
            }
            
            console.log(`[SettingsController] deleteAvailability: Availability deleted successfully`);
            return deletedAvailability;
        } catch (error) {
            console.error(`[SettingsController] deleteAvailability: Error deleting availability`, error);
            throw new Error(`Failed to delete availability: ${error.message}`);
        }
    }

    // Observatory availability specific methods
    async getObsAvailability() {
        try {
            console.log('[SettingsController] getObsAvailability: Fetching observatory availability');
            const availabilities = await this.settingsDao.getAllAvailabilitiesByType('obs');
            console.log(`[SettingsController] getObsAvailability: Found ${availabilities.length} obs availabilities`);
            return availabilities;
        } catch (error) {
            console.error('[SettingsController] getObsAvailability: Error occurred', error);
            throw new Error(`Failed to get observatory availability: ${error.message}`);
        }
    }

    async updateObsAvailability(userId, dates, role) {
        try {
            console.log(`[SettingsController] updateObsAvailability: Updating obs availability for userId: ${userId}`);
            const availability = await this.settingsDao.createOrUpdateAvailability('obs', userId, dates, role);
            console.log(`[SettingsController] updateObsAvailability: Obs availability updated successfully`);
            return availability;
        } catch (error) {
            console.error(`[SettingsController] updateObsAvailability: Error for userId: ${userId}`, error);
            throw new Error(`Failed to update observatory availability: ${error.message}`);
        }
    }

    // Hosting availability specific methods
    async getHostingAvailability() {
        try {
            console.log('[SettingsController] getHostingAvailability: Fetching hosting availability');
            const availabilities = await this.settingsDao.getAllAvailabilitiesByType('hosting');
            console.log(`[SettingsController] getHostingAvailability: Found ${availabilities.length} hosting availabilities`);
            return availabilities;
        } catch (error) {
            console.error('[SettingsController] getHostingAvailability: Error occurred', error);
            throw new Error(`Failed to get hosting availability: ${error.message}`);
        }
    }

    async updateHostingAvailability(userId, dates, role) {
        try {
            console.log(`[SettingsController] updateHostingAvailability: Updating hosting availability for userId: ${userId}`);
            const availability = await this.settingsDao.createOrUpdateAvailability('hosting', userId, dates, role);
            console.log(`[SettingsController] updateHostingAvailability: Hosting availability updated successfully`);
            return availability;
        } catch (error) {
            console.error(`[SettingsController] updateHostingAvailability: Error for userId: ${userId}`, error);
            throw new Error(`Failed to update hosting availability: ${error.message}`);
        }
    }
}
