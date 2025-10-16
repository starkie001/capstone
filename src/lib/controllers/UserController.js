import { UserDao } from '../dao/UserDao.js';
import bcrypt from 'bcryptjs';

export class UserController {
    constructor(userDao = new UserDao()) {
        this.userDao = userDao;
        console.log('[UserController] UserController initialized');
    }

    async getAllUsers() {
        try {
            console.log('[UserController] getAllUsers: Fetching all users');
            const users = await this.userDao.getAllUsers();
            console.log(`[UserController] getAllUsers: Found ${users.length} users`);
            
            // Remove password from response for security
            return users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
        } catch (error) {
            console.error('[UserController] getAllUsers: Error occurred', error);
            throw new Error(`Failed to get all users: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            console.log(`[UserController] getUserById: Fetching user with ID: ${id}`);
            const user = await this.userDao.getUserById(id);
            if (!user) {
                console.log(`[UserController] getUserById: User not found with ID: ${id}`);
                return null;
            }
            console.log(`[UserController] getUserById: User found with ID: ${id}`);
            // Remove password from response for security
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error(`[UserController] getUserById: Error occurred for ID: ${id}`, error);
            throw new Error(`Failed to get user by ID: ${error.message}`);
        }
    }

    async getUserByEmail(email) {
        try {
            console.log(`[UserController] getUserByEmail: Fetching user with email: ${email}`);
            const user = await this.userDao.getUserByEmail(email);
            if (!user) {
                console.log(`[UserController] getUserByEmail: User not found with email: ${email}`);
                return null;
            }
            console.log(`[UserController] getUserByEmail: User found with email: ${email}`);
            // Remove password from response for security
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error(`[UserController] getUserByEmail: Error occurred for email: ${email}`, error);
            throw new Error(`Failed to get user by email: ${error.message}`);
        }
    }

    async authenticateUser(email, password) {
        try {
            console.log(`[UserController] authenticateUser: Attempting authentication for email: ${email}`);
            const user = await this.userDao.getUserByEmail(email);
            if (!user) {
                console.log(`[UserController] authenticateUser: User not found for email: ${email}`);
                return null;
            }

            // Check if user is active
            if (user.status !== 'active') {
                console.log(`[UserController] authenticateUser: User account is not active for email: ${email}, status: ${user.status}`);
                throw new Error('User account is not active');
            }

            // Use bcrypt to compare encrypted passwords
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                console.log(`[UserController] authenticateUser: Invalid password for email: ${email}`);
                return null;
            }

            console.log(`[UserController] authenticateUser: Authentication successful for email: ${email}`);
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error(`[UserController] authenticateUser: Authentication error for email: ${email}`, error);
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            console.log(`[UserController] createUser: Creating user with email: ${userData.email}`);
            
            // Validate required fields
            if (!userData.name || !userData.email) {
                console.error('[UserController] createUser: Missing required fields - name and email are required');
                throw new Error('Name and email are required');
            }

            // Check if user already exists
            const existingUser = await this.userDao.getUserByEmail(userData.email);
            if (existingUser) {
                console.log(`[UserController] createUser: User already exists with email: ${userData.email}`);
                throw new Error('User with this email already exists');
            }

            // Hash password before storing
            if (userData.password) {
                console.log(`[UserController] createUser: Hashing password for user: ${userData.email}`);
                userData.password = await bcrypt.hash(userData.password, 10);
            }
            
            const newUser = await this.userDao.createUser(userData);
            console.log(`[UserController] createUser: User created successfully with ID: ${newUser.id}, email: ${userData.email}`);
            
            // Remove password from response
            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (error) {
            console.error(`[UserController] createUser: Error creating user with email: ${userData.email}`, error);
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    async updateUser(id, updatedData) {
        try {
            console.log(`[UserController] updateUser: Updating user with ID: ${id}`);
            
            // Check if user exists
            const existingUser = await this.userDao.getUserById(id);
            if (!existingUser) {
                console.log(`[UserController] updateUser: User not found with ID: ${id}`);
                return null;
            }

            // If email is being updated, check for duplicates
            if (updatedData.email && updatedData.email !== existingUser.email) {
                console.log(`[UserController] updateUser: Checking email availability for: ${updatedData.email}`);
                const emailExists = await this.userDao.getUserByEmail(updatedData.email);
                if (emailExists) {
                    console.log(`[UserController] updateUser: Email already exists: ${updatedData.email}`);
                    throw new Error('Email already exists');
                }
            }

            // Hash password if it's being updated
            if (updatedData.password) {
                console.log(`[UserController] updateUser: Hashing new password for user ID: ${id}`);
                updatedData.password = await bcrypt.hash(updatedData.password, 10);
            }

            const updatedUser = await this.userDao.updateUser(id, updatedData);
            console.log(`[UserController] updateUser: User updated successfully with ID: ${id}`);
            
            // Remove password from response
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        } catch (error) {
            console.error(`[UserController] updateUser: Error updating user with ID: ${id}`, error);
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            console.log(`[UserController] deleteUser: Deleting user with ID: ${id}`);
            const deletedUser = await this.userDao.deleteUser(id);
            if (!deletedUser) {
                console.log(`[UserController] deleteUser: User not found with ID: ${id}`);
                return null;
            }
            
            console.log(`[UserController] deleteUser: User deleted successfully with ID: ${id}`);
            // Remove password from response
            const { password, ...userWithoutPassword } = deletedUser;
            return userWithoutPassword;
        } catch (error) {
            console.error(`[UserController] deleteUser: Error deleting user with ID: ${id}`, error);
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    async changeUserStatus(id, status) {
        try {
            console.log(`[UserController] changeUserStatus: Changing status for user ID: ${id} to: ${status}`);
            
            if (!['active', 'inactive', 'suspended'].includes(status)) {
                console.error(`[UserController] changeUserStatus: Invalid status provided: ${status}`);
                throw new Error('Invalid status. Must be active, inactive, or suspended');
            }

            const updatedUser = await this.userDao.updateUser(id, { status });
            if (!updatedUser) {
                console.log(`[UserController] changeUserStatus: User not found with ID: ${id}`);
                return null;
            }

            console.log(`[UserController] changeUserStatus: Status changed successfully for user ID: ${id} to: ${status}`);
            // Remove password from response
            const { password, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        } catch (error) {
            console.error(`[UserController] changeUserStatus: Error changing status for user ID: ${id}`, error);
            throw new Error(`Failed to change user status: ${error.message}`);
        }
    }

    async getUsersByRole(role) {
        try {
            console.log(`[UserController] getUsersByRole: Fetching users with role: ${role}`);
            const allUsers = await this.userDao.getAllUsers();
            const filteredUsers = allUsers.filter(user => user.role === role);
            console.log(`[UserController] getUsersByRole: Found ${filteredUsers.length} users with role: ${role}`);
            
            // Remove password from response for security
            return filteredUsers.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
        } catch (error) {
            console.error(`[UserController] getUsersByRole: Error fetching users by role: ${role}`, error);
            throw new Error(`Failed to get users by role: ${error.message}`);
        }
    }
}
