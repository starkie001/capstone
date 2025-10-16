import dbConnect from '../dbConfig.js';
import Booking from '../models/Booking.js';

export class BookingDao {
    async getAllBookings() {
        await dbConnect();
        const bookings = await Booking.find({}).sort({ created: -1 }).lean();
        return bookings.map(booking => ({
            ...booking,
            id: booking._id.toString(),
            _id: undefined
        }));
    }

    async getBookingById(id) {
        await dbConnect();
        const booking = await Booking.findById(id).lean();
        if (!booking) return null;
        return {
            ...booking,
            id: booking._id.toString(),
            _id: undefined
        };
    }

    async getBookingsByUserId(userId) {
        await dbConnect();
        const bookings = await Booking.find({ userId }).sort({ created: -1 }).lean();
        return bookings.map(booking => ({
            ...booking,
            id: booking._id.toString(),
            _id: undefined
        }));
    }

    async getBookingsByDate(date) {
        await dbConnect();
        const bookings = await Booking.find({ date }).lean();
        return bookings.map(booking => ({
            ...booking,
            id: booking._id.toString(),
            _id: undefined
        }));
    }

    async createBooking(bookingData) {
        await dbConnect();
        const newBooking = await Booking.create(bookingData);
        
        return {
            ...newBooking.toObject(),
            id: newBooking._id.toString(),
            _id: undefined
        };
    }

    async updateBooking(id, updatedData) {
        await dbConnect();
        const booking = await Booking.findByIdAndUpdate(
            id,
            updatedData,
            { new: true, runValidators: true }
        ).lean();
        
        if (!booking) return null;
        
        return {
            ...booking,
            id: booking._id.toString(),
            _id: undefined
        };
    }

    async deleteBooking(id) {
        await dbConnect();
        const booking = await Booking.findByIdAndDelete(id).lean();
        if (!booking) return null;
        
        return {
            ...booking,
            id: booking._id.toString(),
            _id: undefined
        };
    }

    async getBookingsByStatus(status) {
        await dbConnect();
        const bookings = await Booking.find({ status }).sort({ created: -1 }).lean();
        return bookings.map(booking => ({
            ...booking,
            id: booking._id.toString(),
            _id: undefined
        }));
    }
}