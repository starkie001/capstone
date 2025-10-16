import dbConnect from '../dbConfig.js';
import User from '../models/User.js';

export class UserDao {
    async getAllUsers() {
        await dbConnect();
        const users = await User.find({}).lean();
        return users.map(user => ({
            ...user,
            id: user._id.toString(),
            _id: undefined
        }));
    }

    async getUserById(id) {
        await dbConnect();
        const user = await User.findById(id).lean();
        if (!user) return null;
        return {
            ...user,
            id: user._id.toString(),
            _id: undefined
        };
    }

    async getUserByEmail(email) {
        await dbConnect();
        const user = await User.findOne({ email }).lean();
        if (!user) return null;
        return {
            ...user,
            id: user._id.toString(),
            _id: undefined
        };
    }

    async createUser(userData) {
        await dbConnect();
        const newUser = await User.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            image: userData.image || null,
            role: userData.role || "guest",
            status: userData.status || "active"
        });
        
        return {
            ...newUser.toObject(),
            id: newUser._id.toString(),
            _id: undefined,
            dateCreated: newUser.createdAt,
            dateUpdated: newUser.updatedAt
        };
    }

    async updateUser(id, updatedData) {
        await dbConnect();
        const user = await User.findByIdAndUpdate(
            id, 
            updatedData,
            { new: true, runValidators: true }
        ).lean();
        
        if (!user) return null;
        
        return {
            ...user,
            id: user._id.toString(),
            _id: undefined,
            dateCreated: user.createdAt,
            dateUpdated: user.updatedAt
        };
    }

    async deleteUser(id) {
        await dbConnect();
        const user = await User.findByIdAndDelete(id).lean();
        if (!user) return null;
        
        return {
            ...user,
            id: user._id.toString(),
            _id: undefined
        };
    }
}