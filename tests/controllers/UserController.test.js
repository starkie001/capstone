import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import bcrypt from 'bcryptjs';
import { UserController } from '../../src/lib/controllers/UserController.js';
import { UserDao } from '../../src/lib/dao/UserDao.js';

use(sinonChai);

describe('UserController', () => {
    let userController;
    let mockUserDao;
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockUserDao = {
            getAllUsers: sandbox.stub(),
            getUserById: sandbox.stub(),
            getUserByEmail: sandbox.stub(),
            createUser: sandbox.stub(),
            updateUser: sandbox.stub(),
            deleteUser: sandbox.stub()
        };
        userController = new UserController(mockUserDao);
        
        // Stub console methods to avoid cluttering test output
        sandbox.stub(console, 'log');
        sandbox.stub(console, 'error');
        
        // Stub bcrypt methods
        sandbox.stub(bcrypt, 'hash');
        sandbox.stub(bcrypt, 'compare');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with a UserDao instance', () => {
            expect(userController.userDao).to.exist;
            expect(userController.userDao).to.equal(mockUserDao);
        });

        it('should use provided UserDao instance', () => {
            const customDao = { test: 'dao' };
            const controller = new UserController(customDao);
            expect(controller.userDao).to.equal(customDao);
        });
    });

    describe('getAllUsers', () => {
        it('should return all users without passwords', async () => {
            const mockUsers = [
                { id: '1', name: 'User 1', email: 'user1@test.com', password: 'hashedpwd1', role: 'member' },
                { id: '2', name: 'User 2', email: 'user2@test.com', password: 'hashedpwd2', role: 'admin' }
            ];
            mockUserDao.getAllUsers.resolves(mockUsers);

            const result = await userController.getAllUsers();

            expect(result).to.have.lengthOf(2);
            expect(result[0]).to.not.have.property('password');
            expect(result[1]).to.not.have.property('password');
            expect(result[0]).to.include({ id: '1', name: 'User 1', email: 'user1@test.com', role: 'member' });
            expect(result[1]).to.include({ id: '2', name: 'User 2', email: 'user2@test.com', role: 'admin' });
            expect(mockUserDao.getAllUsers).to.have.been.calledOnce;
        });

        it('should return empty array when no users exist', async () => {
            mockUserDao.getAllUsers.resolves([]);

            const result = await userController.getAllUsers();

            expect(result).to.be.an('array');
            expect(result).to.be.empty;
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockUserDao.getAllUsers.rejects(error);

            try {
                await userController.getAllUsers();
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get all users');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('getUserById', () => {
        it('should return user without password when found', async () => {
            const mockUser = { id: '1', name: 'User 1', email: 'user1@test.com', password: 'hashedpwd', role: 'member' };
            mockUserDao.getUserById.resolves(mockUser);

            const result = await userController.getUserById('1');

            expect(result).to.not.have.property('password');
            expect(result).to.include({ id: '1', name: 'User 1', email: 'user1@test.com', role: 'member' });
            expect(mockUserDao.getUserById).to.have.been.calledWith('1');
        });

        it('should return null when user not found', async () => {
            mockUserDao.getUserById.resolves(null);

            const result = await userController.getUserById('999');

            expect(result).to.be.null;
            expect(mockUserDao.getUserById).to.have.been.calledWith('999');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockUserDao.getUserById.rejects(error);

            try {
                await userController.getUserById('1');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get user by ID');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('getUserByEmail', () => {
        it('should return user without password when found', async () => {
            const mockUser = { id: '1', name: 'User 1', email: 'user1@test.com', password: 'hashedpwd', role: 'member' };
            mockUserDao.getUserByEmail.resolves(mockUser);

            const result = await userController.getUserByEmail('user1@test.com');

            expect(result).to.not.have.property('password');
            expect(result).to.include({ id: '1', name: 'User 1', email: 'user1@test.com', role: 'member' });
            expect(mockUserDao.getUserByEmail).to.have.been.calledWith('user1@test.com');
        });

        it('should return null when user not found', async () => {
            mockUserDao.getUserByEmail.resolves(null);

            const result = await userController.getUserByEmail('nonexistent@test.com');

            expect(result).to.be.null;
            expect(mockUserDao.getUserByEmail).to.have.been.calledWith('nonexistent@test.com');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockUserDao.getUserByEmail.rejects(error);

            try {
                await userController.getUserByEmail('user1@test.com');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get user by email');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('authenticateUser', () => {
        it('should return user without password when authentication successful', async () => {
            const mockUser = { 
                id: '1', 
                name: 'User 1', 
                email: 'user1@test.com', 
                password: 'hashedpwd', 
                status: 'active',
                role: 'member' 
            };
            mockUserDao.getUserByEmail.resolves(mockUser);
            bcrypt.compare.resolves(true);

            const result = await userController.authenticateUser('user1@test.com', 'plainpassword');

            expect(result).to.not.have.property('password');
            expect(result).to.include({ id: '1', name: 'User 1', email: 'user1@test.com', status: 'active', role: 'member' });
            expect(mockUserDao.getUserByEmail).to.have.been.calledWith('user1@test.com');
            expect(bcrypt.compare).to.have.been.calledWith('plainpassword', 'hashedpwd');
        });

        it('should return null when user not found', async () => {
            mockUserDao.getUserByEmail.resolves(null);

            const result = await userController.authenticateUser('nonexistent@test.com', 'password');

            expect(result).to.be.null;
            expect(mockUserDao.getUserByEmail).to.have.been.calledWith('nonexistent@test.com');
        });

        it('should throw error when user account is not active', async () => {
            const mockUser = { 
                id: '1', 
                name: 'User 1', 
                email: 'user1@test.com', 
                password: 'hashedpwd', 
                status: 'inactive',
                role: 'member' 
            };
            mockUserDao.getUserByEmail.resolves(mockUser);

            try {
                await userController.authenticateUser('user1@test.com', 'password');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Authentication failed: User account is not active');
            }
        });

        it('should return null when password is invalid', async () => {
            const mockUser = { 
                id: '1', 
                name: 'User 1', 
                email: 'user1@test.com', 
                password: 'hashedpwd', 
                status: 'active',
                role: 'member' 
            };
            mockUserDao.getUserByEmail.resolves(mockUser);
            bcrypt.compare.resolves(false);

            const result = await userController.authenticateUser('user1@test.com', 'wrongpassword');

            expect(result).to.be.null;
            expect(bcrypt.compare).to.have.been.calledWith('wrongpassword', 'hashedpwd');
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockUserDao.getUserByEmail.rejects(error);

            try {
                await userController.authenticateUser('user1@test.com', 'password');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Authentication failed');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('createUser', () => {
        it('should create user with hashed password and return without password', async () => {
            const userData = { name: 'New User', email: 'new@test.com', password: 'plainpassword' };
            const hashedPassword = 'hashedpassword123';
            const createdUser = { id: '1', name: 'New User', email: 'new@test.com', password: hashedPassword };
            
            mockUserDao.getUserByEmail.resolves(null); // User doesn't exist
            bcrypt.hash.resolves(hashedPassword);
            mockUserDao.createUser.resolves(createdUser);

            const result = await userController.createUser(userData);

            expect(result).to.not.have.property('password');
            expect(result).to.include({ id: '1', name: 'New User', email: 'new@test.com' });
            expect(bcrypt.hash).to.have.been.calledWith('plainpassword', 10);
            expect(mockUserDao.createUser).to.have.been.calledWith({
                name: 'New User',
                email: 'new@test.com',
                password: hashedPassword
            });
        });

        it('should throw error when name is missing', async () => {
            try {
                await userController.createUser({ email: 'test@test.com' });
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create user: Name and email are required');
            }
        });

        it('should throw error when email is missing', async () => {
            try {
                await userController.createUser({ name: 'Test User' });
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create user: Name and email are required');
            }
        });

        it('should throw error when user already exists', async () => {
            const userData = { name: 'New User', email: 'existing@test.com' };
            const existingUser = { id: '1', email: 'existing@test.com' };
            
            mockUserDao.getUserByEmail.resolves(existingUser);

            try {
                await userController.createUser(userData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create user: User with this email already exists');
            }
        });

        it('should create user without password field', async () => {
            const userData = { name: 'New User', email: 'new@test.com' };
            const createdUser = { id: '1', name: 'New User', email: 'new@test.com' };
            
            mockUserDao.getUserByEmail.resolves(null);
            mockUserDao.createUser.resolves(createdUser);

            const result = await userController.createUser(userData);

            expect(result).to.deep.equal(createdUser);
            expect(bcrypt.hash).to.not.have.been.called;
        });

        it('should throw error when DAO fails', async () => {
            const userData = { name: 'New User', email: 'new@test.com' };
            const error = new Error('Database error');
            
            mockUserDao.getUserByEmail.resolves(null);
            mockUserDao.createUser.rejects(error);

            try {
                await userController.createUser(userData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to create user');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('updateUser', () => {
        it('should update user and return without password', async () => {
            const existingUser = { id: '1', name: 'Old Name', email: 'old@test.com', password: 'oldpwd' };
            const updatedData = { name: 'New Name' };
            const updatedUser = { id: '1', name: 'New Name', email: 'old@test.com', password: 'oldpwd' };
            
            mockUserDao.getUserById.resolves(existingUser);
            mockUserDao.updateUser.resolves(updatedUser);

            const result = await userController.updateUser('1', updatedData);

            expect(result).to.not.have.property('password');
            expect(result).to.include({ id: '1', name: 'New Name', email: 'old@test.com' });
            expect(mockUserDao.updateUser).to.have.been.calledWith('1', updatedData);
        });

        it('should return null when user not found', async () => {
            mockUserDao.getUserById.resolves(null);

            const result = await userController.updateUser('999', { name: 'New Name' });

            expect(result).to.be.null;
        });

        it('should hash new password when updating', async () => {
            const existingUser = { id: '1', name: 'User', email: 'user@test.com', password: 'oldpwd' };
            const updatedData = { password: 'newpassword' };
            const hashedPassword = 'hashedpassword123';
            const updatedUser = { id: '1', name: 'User', email: 'user@test.com', password: hashedPassword };
            
            mockUserDao.getUserById.resolves(existingUser);
            bcrypt.hash.resolves(hashedPassword);
            mockUserDao.updateUser.resolves(updatedUser);

            const result = await userController.updateUser('1', updatedData);

            expect(bcrypt.hash).to.have.been.calledWith('newpassword', 10);
            expect(mockUserDao.updateUser).to.have.been.calledWith('1', { password: hashedPassword });
            expect(result).to.not.have.property('password');
        });

        it('should check email availability when updating email', async () => {
            const existingUser = { id: '1', name: 'User', email: 'old@test.com' };
            const updatedData = { email: 'new@test.com' };
            const updatedUser = { id: '1', name: 'User', email: 'new@test.com' };
            
            mockUserDao.getUserById.resolves(existingUser);
            mockUserDao.getUserByEmail.resolves(null); // New email is available
            mockUserDao.updateUser.resolves(updatedUser);

            const result = await userController.updateUser('1', updatedData);

            expect(mockUserDao.getUserByEmail).to.have.been.calledWith('new@test.com');
            expect(result).to.include({ email: 'new@test.com' });
        });

        it('should throw error when new email already exists', async () => {
            const existingUser = { id: '1', name: 'User', email: 'old@test.com' };
            const updatedData = { email: 'existing@test.com' };
            const emailExists = { id: '2', email: 'existing@test.com' };
            
            mockUserDao.getUserById.resolves(existingUser);
            mockUserDao.getUserByEmail.resolves(emailExists);

            try {
                await userController.updateUser('1', updatedData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to update user: Email already exists');
            }
        });

        it('should not check email availability when email is not changing', async () => {
            const existingUser = { id: '1', name: 'User', email: 'same@test.com' };
            const updatedData = { email: 'same@test.com', name: 'Updated Name' };
            const updatedUser = { id: '1', name: 'Updated Name', email: 'same@test.com' };
            
            mockUserDao.getUserById.resolves(existingUser);
            mockUserDao.updateUser.resolves(updatedUser);

            const result = await userController.updateUser('1', updatedData);

            expect(mockUserDao.getUserByEmail).to.not.have.been.called;
            expect(result).to.include({ name: 'Updated Name' });
        });

        it('should throw error when DAO fails', async () => {
            const existingUser = { id: '1', name: 'User', email: 'user@test.com' };
            const error = new Error('Database error');
            
            mockUserDao.getUserById.resolves(existingUser);
            mockUserDao.updateUser.rejects(error);

            try {
                await userController.updateUser('1', { name: 'New Name' });
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to update user');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('deleteUser', () => {
        it('should delete user and return without password', async () => {
            const deletedUser = { id: '1', name: 'User', email: 'user@test.com', password: 'hashedpwd' };
            mockUserDao.deleteUser.resolves(deletedUser);

            const result = await userController.deleteUser('1');

            expect(result).to.not.have.property('password');
            expect(result).to.include({ id: '1', name: 'User', email: 'user@test.com' });
            expect(mockUserDao.deleteUser).to.have.been.calledWith('1');
        });

        it('should return null when user not found', async () => {
            mockUserDao.deleteUser.resolves(null);

            const result = await userController.deleteUser('999');

            expect(result).to.be.null;
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockUserDao.deleteUser.rejects(error);

            try {
                await userController.deleteUser('1');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to delete user');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('changeUserStatus', () => {
        it('should change user status with valid status', async () => {
            const updatedUser = { id: '1', name: 'User', email: 'user@test.com', status: 'inactive', password: 'pwd' };
            mockUserDao.updateUser.resolves(updatedUser);

            const result = await userController.changeUserStatus('1', 'inactive');

            expect(result).to.not.have.property('password');
            expect(result).to.include({ id: '1', status: 'inactive' });
            expect(mockUserDao.updateUser).to.have.been.calledWith('1', { status: 'inactive' });
        });

        it('should accept all valid statuses', async () => {
            const validStatuses = ['active', 'inactive', 'suspended'];
            
            for (const status of validStatuses) {
                mockUserDao.updateUser.resolves({ id: '1', status, password: 'pwd' });
                
                const result = await userController.changeUserStatus('1', status);
                
                expect(result.status).to.equal(status);
                expect(result).to.not.have.property('password');
            }
        });

        it('should throw error for invalid status', async () => {
            try {
                await userController.changeUserStatus('1', 'invalid');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to change user status: Invalid status. Must be active, inactive, or suspended');
            }
        });

        it('should return null when user not found', async () => {
            mockUserDao.updateUser.resolves(null);

            const result = await userController.changeUserStatus('999', 'active');

            expect(result).to.be.null;
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockUserDao.updateUser.rejects(error);

            try {
                await userController.changeUserStatus('1', 'active');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to change user status');
                expect(err.message).to.include('Database error');
            }
        });
    });

    describe('getUsersByRole', () => {
        it('should return users with specific role without passwords', async () => {
            const mockUsers = [
                { id: '1', name: 'Admin 1', email: 'admin1@test.com', role: 'admin', password: 'pwd1' },
                { id: '2', name: 'Member 1', email: 'member1@test.com', role: 'member', password: 'pwd2' },
                { id: '3', name: 'Admin 2', email: 'admin2@test.com', role: 'admin', password: 'pwd3' }
            ];
            mockUserDao.getAllUsers.resolves(mockUsers);

            const result = await userController.getUsersByRole('admin');

            expect(result).to.have.lengthOf(2);
            expect(result[0]).to.not.have.property('password');
            expect(result[1]).to.not.have.property('password');
            expect(result[0]).to.include({ id: '1', name: 'Admin 1', role: 'admin' });
            expect(result[1]).to.include({ id: '3', name: 'Admin 2', role: 'admin' });
        });

        it('should return empty array when no users have the role', async () => {
            const mockUsers = [
                { id: '1', name: 'Member 1', email: 'member1@test.com', role: 'member', password: 'pwd1' }
            ];
            mockUserDao.getAllUsers.resolves(mockUsers);

            const result = await userController.getUsersByRole('admin');

            expect(result).to.be.an('array');
            expect(result).to.be.empty;
        });

        it('should return empty array when no users exist', async () => {
            mockUserDao.getAllUsers.resolves([]);

            const result = await userController.getUsersByRole('admin');

            expect(result).to.be.an('array');
            expect(result).to.be.empty;
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockUserDao.getAllUsers.rejects(error);

            try {
                await userController.getUsersByRole('admin');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.include('Failed to get users by role');
                expect(err.message).to.include('Database error');
            }
        });
    });
});