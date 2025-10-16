import { BookingDao } from '../dao/bookingDao.js';

export class BookingController {
    constructor(bookingDao = new BookingDao()) {
        this.bookingDao = bookingDao;
        console.log('[BookingController] BookingController initialized');
    }

    async getAllBookings() {
        try {
            console.log('[BookingController] getAllBookings: Fetching all bookings');
            const bookings = await this.bookingDao.getAllBookings();
            console.log(`[BookingController] getAllBookings: Found ${bookings.length} bookings`);
            return bookings;
        } catch (error) {
            console.error('[BookingController] getAllBookings: Error occurred', error);
            throw new Error(`Failed to get all bookings: ${error.message}`);
        }
    }

    async getBookingById(id) {
        try {
            console.log(`[BookingController] getBookingById: Fetching booking with ID: ${id}`);
            const booking = await this.bookingDao.getBookingById(id);
            if (!booking) {
                console.log(`[BookingController] getBookingById: Booking not found with ID: ${id}`);
                return null;
            }
            console.log(`[BookingController] getBookingById: Booking found with ID: ${id}`);
            return booking;
        } catch (error) {
            console.error(`[BookingController] getBookingById: Error occurred for ID: ${id}`, error);
            throw new Error(`Failed to get booking by ID: ${error.message}`);
        }
    }

    async getBookingsByUserId(userId) {
        try {
            console.log(`[BookingController] getBookingsByUserId: Fetching bookings for user ID: ${userId}`);
            const bookings = await this.bookingDao.getBookingsByUserId(userId);
            console.log(`[BookingController] getBookingsByUserId: Found ${bookings.length} bookings for user ID: ${userId}`);
            return bookings;
        } catch (error) {
            console.error(`[BookingController] getBookingsByUserId: Error occurred for user ID: ${userId}`, error);
            throw new Error(`Failed to get bookings by user ID: ${error.message}`);
        }
    }

    async getBookingsByDate(date) {
        try {
            console.log(`[BookingController] getBookingsByDate: Fetching bookings for date: ${date}`);
            const bookings = await this.bookingDao.getBookingsByDate(date);
            console.log(`[BookingController] getBookingsByDate: Found ${bookings.length} bookings for date: ${date}`);
            return bookings;
        } catch (error) {
            console.error(`[BookingController] getBookingsByDate: Error occurred for date: ${date}`, error);
            throw new Error(`Failed to get bookings by date: ${error.message}`);
        }
    }

    async getBookingsByStatus(status) {
        try {
            console.log(`[BookingController] getBookingsByStatus: Fetching bookings with status: ${status}`);
            const bookings = await this.bookingDao.getBookingsByStatus(status);
            console.log(`[BookingController] getBookingsByStatus: Found ${bookings.length} bookings with status: ${status}`);
            return bookings;
        } catch (error) {
            console.error(`[BookingController] getBookingsByStatus: Error occurred for status: ${status}`, error);
            throw new Error(`Failed to get bookings by status: ${error.message}`);
        }
    }

    async createBooking(bookingData) {
        try {
            console.log(`[BookingController] createBooking: Creating booking for user ID: ${bookingData.userId}`);
            
            // Validate required fields
            if (!bookingData.userId || !bookingData.groupName || !bookingData.groupType || 
                !bookingData.groupSize || !bookingData.date) {
                console.error('[BookingController] createBooking: Missing required fields');
                throw new Error('Missing required booking fields');
            }

            const newBooking = await this.bookingDao.createBooking(bookingData);
            console.log(`[BookingController] createBooking: Booking created successfully with ID: ${newBooking.id}`);
            return newBooking;
        } catch (error) {
            console.error('[BookingController] createBooking: Error creating booking', error);
            throw new Error(`Failed to create booking: ${error.message}`);
        }
    }

    async updateBooking(id, updatedData) {
        try {
            console.log(`[BookingController] updateBooking: Updating booking with ID: ${id}`);
            
            const updatedBooking = await this.bookingDao.updateBooking(id, updatedData);
            if (!updatedBooking) {
                console.log(`[BookingController] updateBooking: Booking not found with ID: ${id}`);
                return null;
            }
            
            console.log(`[BookingController] updateBooking: Booking updated successfully with ID: ${id}`);
            return updatedBooking;
        } catch (error) {
            console.error(`[BookingController] updateBooking: Error updating booking with ID: ${id}`, error);
            throw new Error(`Failed to update booking: ${error.message}`);
        }
    }

    async updateBookingStatus(id, status) {
        try {
            console.log(`[BookingController] updateBookingStatus: Updating booking status for ID: ${id} to: ${status}`);
            
            if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
                console.error(`[BookingController] updateBookingStatus: Invalid status provided: ${status}`);
                throw new Error('Invalid status. Must be pending, confirmed, cancelled, or completed');
            }

            const updatedBooking = await this.bookingDao.updateBooking(id, { status });
            if (!updatedBooking) {
                console.log(`[BookingController] updateBookingStatus: Booking not found with ID: ${id}`);
                return null;
            }

            console.log(`[BookingController] updateBookingStatus: Booking status updated successfully for ID: ${id}`);
            return updatedBooking;
        } catch (error) {
            console.error(`[BookingController] updateBookingStatus: Error updating booking status for ID: ${id}`, error);
            throw new Error(`Failed to update booking status: ${error.message}`);
        }
    }

    async deleteBooking(id) {
        try {
            console.log(`[BookingController] deleteBooking: Deleting booking with ID: ${id}`);
            const deletedBooking = await this.bookingDao.deleteBooking(id);
            if (!deletedBooking) {
                console.log(`[BookingController] deleteBooking: Booking not found with ID: ${id}`);
                return null;
            }
            
            console.log(`[BookingController] deleteBooking: Booking deleted successfully with ID: ${id}`);
            return deletedBooking;
        } catch (error) {
            console.error(`[BookingController] deleteBooking: Error deleting booking with ID: ${id}`, error);
            throw new Error(`Failed to delete booking: ${error.message}`);
        }
    }

    async getAvailableDates(startDate, endDate) {
        try {
            console.log(`[BookingController] getAvailableDates: Checking availability from ${startDate} to ${endDate}`);
            const bookings = await this.bookingDao.getAllBookings();
            
            // Filter bookings within the date range
            const bookedDates = bookings
                .filter(booking => {
                    const bookingDate = new Date(booking.date);
                    return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
                })
                .map(booking => booking.date);
            
            console.log(`[BookingController] getAvailableDates: Found ${bookedDates.length} booked dates`);
            return bookedDates;
        } catch (error) {
            console.error('[BookingController] getAvailableDates: Error checking availability', error);
            throw new Error(`Failed to get available dates: ${error.message}`);
        }
    }
}
