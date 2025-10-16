import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SettingsController } from '../../src/lib/controllers/SettingsController.js';
import { SettingsDao } from '../../src/lib/dao/settingsDao.js';

use(sinonChai);

describe('SettingsController', () => {
    let settingsController;
    let mockSettingsDao;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockSettingsDao = {
            getAllSettings: sandbox.stub(),
            getSettingByKey: sandbox.stub(),
            createOrUpdateSetting: sandbox.stub(),
            deleteSetting: sandbox.stub(),
            getAvailability: sandbox.stub(),
            getAllAvailabilitiesByType: sandbox.stub(),
            createOrUpdateAvailability: sandbox.stub(),
            deleteAvailability: sandbox.stub()
        };
        settingsController = new SettingsController(mockSettingsDao);
        
        // Stub console methods to avoid cluttering test output
        sandbox.stub(console, 'log');
        sandbox.stub(console, 'error');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with a SettingsDao instance', () => {
            expect(settingsController.settingsDao).to.exist;
            expect(settingsController.settingsDao).to.equal(mockSettingsDao);
        });

        it('should use provided SettingsDao instance', () => {
            const customDao = { test: 'dao' };
            const controller = new SettingsController(customDao);
            expect(controller.settingsDao).to.equal(customDao);
        });
    });

    describe('getAllSettings', () => {
        it('should return all settings when successful', async () => {
            const mockSettings = [
                { key: 'setting1', value: 'value1', description: 'desc1' },
                { key: 'setting2', value: 'value2', description: 'desc2' }
            ];
            mockSettingsDao.getAllSettings.resolves(mockSettings);

            const result = await settingsController.getAllSettings();

            expect(result).to.deep.equal(mockSettings);
            expect(mockSettingsDao.getAllSettings).to.have.been.calledOnce;
        });

        it('should throw an error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.getAllSettings.rejects(error);

            try {
                await settingsController.getAllSettings();
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get all settings');
                expect(err.message).to.include('Database error');
            }
        });

        it('should return empty array when no settings exist', async () => {
            mockSettingsDao.getAllSettings.resolves([]);

            const result = await settingsController.getAllSettings();

            expect(result).to.be.an('array');
            expect(result).to.be.empty;
        });
    });

    describe('getSettingByKey', () => {
        it('should return setting when found', async () => {
            const mockSetting = { key: 'testKey', value: 'testValue', description: 'desc' };
            mockSettingsDao.getSettingByKey.resolves(mockSetting);

            const result = await settingsController.getSettingByKey('testKey');

            expect(result).to.deep.equal(mockSetting);
            expect(mockSettingsDao.getSettingByKey).to.have.been.calledWith('testKey');
        });

        it('should return null when setting not found', async () => {
            mockSettingsDao.getSettingByKey.resolves(null);

            const result = await settingsController.getSettingByKey('nonexistent');

            expect(result).to.be.null;
            expect(mockSettingsDao.getSettingByKey).to.have.been.calledWith('nonexistent');
        });

        it('should throw an error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.getSettingByKey.rejects(error);

            try {
                await settingsController.getSettingByKey('testKey');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get setting by key');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('createOrUpdateSetting', () => {
        it('should create/update setting with valid data', async () => {
            const mockSetting = { key: 'testKey', value: 'testValue', description: 'desc' };
            mockSettingsDao.createOrUpdateSetting.resolves(mockSetting);

            const result = await settingsController.createOrUpdateSetting('testKey', 'testValue', 'desc');

            expect(result).to.deep.equal(mockSetting);
            expect(mockSettingsDao.createOrUpdateSetting).to.have.been.calledWith('testKey', 'testValue', 'desc');
        });

        it('should throw error when key is missing', async () => {
            try {
                await settingsController.createOrUpdateSetting('', 'value');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Setting key is required');
            }
        });

        it('should throw error when key is null', async () => {
            try {
                await settingsController.createOrUpdateSetting(null, 'value');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Setting key is required');
            }
        });

        it('should create setting with empty description when not provided', async () => {
            const mockSetting = { key: 'testKey', value: 'testValue', description: '' };
            mockSettingsDao.createOrUpdateSetting.resolves(mockSetting);

            const result = await settingsController.createOrUpdateSetting('testKey', 'testValue');

            expect(result).to.deep.equal(mockSetting);
            expect(mockSettingsDao.createOrUpdateSetting).to.have.been.calledWith('testKey', 'testValue', '');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.createOrUpdateSetting.rejects(error);

            try {
                await settingsController.createOrUpdateSetting('testKey', 'testValue');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to create/update setting');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('deleteSetting', () => {
        it('should delete setting when it exists', async () => {
            const mockSetting = { key: 'testKey', value: 'testValue' };
            mockSettingsDao.deleteSetting.resolves(mockSetting);

            const result = await settingsController.deleteSetting('testKey');

            expect(result).to.deep.equal(mockSetting);
            expect(mockSettingsDao.deleteSetting).to.have.been.calledWith('testKey');
        });

        it('should return null when setting not found', async () => {
            mockSettingsDao.deleteSetting.resolves(null);

            const result = await settingsController.deleteSetting('nonexistent');

            expect(result).to.be.null;
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.deleteSetting.rejects(error);

            try {
                await settingsController.deleteSetting('testKey');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to delete setting');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('getAvailability', () => {
        it('should return availability for specific type and user', async () => {
            const mockAvailabilities = [
                { type: 'hosting', userId: 'user1', dates: ['2025-10-20'] }
            ];
            mockSettingsDao.getAvailability.resolves(mockAvailabilities);

            const result = await settingsController.getAvailability('hosting', 'user1');

            expect(result).to.deep.equal(mockAvailabilities);
            expect(mockSettingsDao.getAvailability).to.have.been.calledWith('hosting', 'user1');
        });

        it('should return availability for type without userId', async () => {
            const mockAvailabilities = [
                { type: 'obs', userId: 'user1', dates: ['2025-10-20'] }
            ];
            mockSettingsDao.getAvailability.resolves(mockAvailabilities);

            const result = await settingsController.getAvailability('obs');

            expect(result).to.deep.equal(mockAvailabilities);
            expect(mockSettingsDao.getAvailability).to.have.been.calledWith('obs', null);
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.getAvailability.rejects(error);

            try {
                await settingsController.getAvailability('hosting');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get availability');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('getAllAvailabilitiesByType', () => {
        it('should return all availabilities for specific type', async () => {
            const mockAvailabilities = [
                { type: 'hosting', userId: 'user1', dates: ['2025-10-20'] },
                { type: 'hosting', userId: 'user2', dates: ['2025-10-21'] }
            ];
            mockSettingsDao.getAllAvailabilitiesByType.resolves(mockAvailabilities);

            const result = await settingsController.getAllAvailabilitiesByType('hosting');

            expect(result).to.deep.equal(mockAvailabilities);
            expect(mockSettingsDao.getAllAvailabilitiesByType).to.have.been.calledWith('hosting');
        });

        it('should return empty array when no availabilities exist', async () => {
            mockSettingsDao.getAllAvailabilitiesByType.resolves([]);

            const result = await settingsController.getAllAvailabilitiesByType('obs');

            expect(result).to.be.an('array');
            expect(result).to.be.empty;
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.getAllAvailabilitiesByType.rejects(error);

            try {
                await settingsController.getAllAvailabilitiesByType('hosting');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get availabilities by type');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('createOrUpdateAvailability', () => {
        it('should create/update availability with valid data', async () => {
            const mockAvailability = { type: 'hosting', userId: 'user1', dates: ['2025-10-20'], role: 'host' };
            mockSettingsDao.createOrUpdateAvailability.resolves(mockAvailability);

            const result = await settingsController.createOrUpdateAvailability('hosting', 'user1', ['2025-10-20'], 'host');

            expect(result).to.deep.equal(mockAvailability);
            expect(mockSettingsDao.createOrUpdateAvailability).to.have.been.calledWith('hosting', 'user1', ['2025-10-20'], 'host');
        });

        it('should throw error when type is missing', async () => {
            try {
                await settingsController.createOrUpdateAvailability('', 'user1', ['2025-10-20']);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Type and userId are required');
            }
        });

        it('should throw error when userId is missing', async () => {
            try {
                await settingsController.createOrUpdateAvailability('hosting', '', ['2025-10-20']);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Type and userId are required');
            }
        });

        it('should throw error for invalid type', async () => {
            try {
                await settingsController.createOrUpdateAvailability('invalid', 'user1', ['2025-10-20']);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Invalid type. Must be hosting or obs');
            }
        });

        it('should accept hosting type', async () => {
            const mockAvailability = { type: 'hosting', userId: 'user1', dates: ['2025-10-20'] };
            mockSettingsDao.createOrUpdateAvailability.resolves(mockAvailability);

            const result = await settingsController.createOrUpdateAvailability('hosting', 'user1', ['2025-10-20']);

            expect(result).to.deep.equal(mockAvailability);
        });

        it('should accept obs type', async () => {
            const mockAvailability = { type: 'obs', userId: 'user1', dates: ['2025-10-20'] };
            mockSettingsDao.createOrUpdateAvailability.resolves(mockAvailability);

            const result = await settingsController.createOrUpdateAvailability('obs', 'user1', ['2025-10-20']);

            expect(result).to.deep.equal(mockAvailability);
        });

        it('should work without role parameter', async () => {
            const mockAvailability = { type: 'hosting', userId: 'user1', dates: ['2025-10-20'] };
            mockSettingsDao.createOrUpdateAvailability.resolves(mockAvailability);

            const result = await settingsController.createOrUpdateAvailability('hosting', 'user1', ['2025-10-20']);

            expect(result).to.deep.equal(mockAvailability);
            expect(mockSettingsDao.createOrUpdateAvailability).to.have.been.calledWith('hosting', 'user1', ['2025-10-20'], null);
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.createOrUpdateAvailability.rejects(error);

            try {
                await settingsController.createOrUpdateAvailability('hosting', 'user1', ['2025-10-20']);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to create/update availability');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('deleteAvailability', () => {
        it('should delete availability when it exists', async () => {
            const mockAvailability = { type: 'hosting', userId: 'user1', dates: ['2025-10-20'] };
            mockSettingsDao.deleteAvailability.resolves(mockAvailability);

            const result = await settingsController.deleteAvailability('hosting', 'user1');

            expect(result).to.deep.equal(mockAvailability);
            expect(mockSettingsDao.deleteAvailability).to.have.been.calledWith('hosting', 'user1');
        });

        it('should return null when availability not found', async () => {
            mockSettingsDao.deleteAvailability.resolves(null);

            const result = await settingsController.deleteAvailability('hosting', 'user1');

            expect(result).to.be.null;
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.deleteAvailability.rejects(error);

            try {
                await settingsController.deleteAvailability('hosting', 'user1');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to delete availability');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('getObsAvailability', () => {
        it('should return observatory availability', async () => {
            const mockAvailabilities = [
                { type: 'obs', userId: 'user1', dates: ['2025-10-20'] }
            ];
            mockSettingsDao.getAllAvailabilitiesByType.resolves(mockAvailabilities);

            const result = await settingsController.getObsAvailability();

            expect(result).to.deep.equal(mockAvailabilities);
            expect(mockSettingsDao.getAllAvailabilitiesByType).to.have.been.calledWith('obs');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.getAllAvailabilitiesByType.rejects(error);

            try {
                await settingsController.getObsAvailability();
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get observatory availability');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('updateObsAvailability', () => {
        it('should update observatory availability', async () => {
            const mockAvailability = { type: 'obs', userId: 'user1', dates: ['2025-10-20'], role: 'observer' };
            mockSettingsDao.createOrUpdateAvailability.resolves(mockAvailability);

            const result = await settingsController.updateObsAvailability('user1', ['2025-10-20'], 'observer');

            expect(result).to.deep.equal(mockAvailability);
            expect(mockSettingsDao.createOrUpdateAvailability).to.have.been.calledWith('obs', 'user1', ['2025-10-20'], 'observer');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.createOrUpdateAvailability.rejects(error);

            try {
                await settingsController.updateObsAvailability('user1', ['2025-10-20'], 'observer');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to update observatory availability');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('getHostingAvailability', () => {
        it('should return hosting availability', async () => {
            const mockAvailabilities = [
                { type: 'hosting', userId: 'user1', dates: ['2025-10-20'] }
            ];
            mockSettingsDao.getAllAvailabilitiesByType.resolves(mockAvailabilities);

            const result = await settingsController.getHostingAvailability();

            expect(result).to.deep.equal(mockAvailabilities);
            expect(mockSettingsDao.getAllAvailabilitiesByType).to.have.been.calledWith('hosting');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.getAllAvailabilitiesByType.rejects(error);

            try {
                await settingsController.getHostingAvailability();
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get hosting availability');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('updateHostingAvailability', () => {
        it('should update hosting availability', async () => {
            const mockAvailability = { type: 'hosting', userId: 'user1', dates: ['2025-10-20'], role: 'host' };
            mockSettingsDao.createOrUpdateAvailability.resolves(mockAvailability);

            const result = await settingsController.updateHostingAvailability('user1', ['2025-10-20'], 'host');

            expect(result).to.deep.equal(mockAvailability);
            expect(mockSettingsDao.createOrUpdateAvailability).to.have.been.calledWith('hosting', 'user1', ['2025-10-20'], 'host');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockSettingsDao.createOrUpdateAvailability.rejects(error);

            try {
                await settingsController.updateHostingAvailability('user1', ['2025-10-20'], 'host');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to update hosting availability');
                expect(err.message).to.include('Database error');
            }
        });
    });
});