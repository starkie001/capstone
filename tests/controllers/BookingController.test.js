import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { BookingController } from '../../src/lib/controllers/BookingController.js';
import { BookingDao } from '../../src/lib/dao/bookingDao.js';

use(sinonChai);

describe('BookingController', () => {
    let bookingController;
    let mockBookingDao;
    let sandbox;

    // Sample test data
    const mockBooking = {
        id: '507f1f77bcf86cd799439011',
        userId: 'user123',
        role: 'customer',
        groupName: 'Test Group',
        groupType: 'Family',
        groupSize: 5,
        interests: ['Stars', 'Planets'],
        otherInfo: 'Test booking info',
        date: '2025-10-20',
        status: 'pending',
        created: '2025-10-16T10:00:00.000Z'
    };

    const mockBookings = [
        mockBooking,
        {
            id: '507f1f77bcf86cd799439012',
            userId: 'user456',
            role: 'member',
            groupName: 'Another Group',
            groupType: 'Club',
            groupSize: 3,
            interests: ['Nebula'],
            otherInfo: '',
            date: '2025-10-21',
            status: 'confirmed',
            created: '2025-10-16T11:00:00.000Z'
        }
    ];

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockBookingDao = sandbox.createStubInstance(BookingDao);
        
        // Stub console methods to avoid cluttering test output
        sandbox.stub(console, 'log');
        sandbox.stub(console, 'error');
        
        bookingController = new BookingController(mockBookingDao);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with a BookingDao instance', () => {
            expect(bookingController.bookingDao).to.be.instanceOf(BookingDao);
        });

        it('should use provided BookingDao instance', () => {
            const customDao = sandbox.createStubInstance(BookingDao);
            const controller = new BookingController(customDao);
            expect(controller.bookingDao).to.equal(customDao);
        });
    });

    describe('getAllBookings', () => {
        it('should return all bookings when successful', async () => {
            mockBookingDao.getAllBookings.resolves(mockBookings);

            const result = await bookingController.getAllBookings();

            expect(mockBookingDao.getAllBookings.calledOnce).to.be.true;
            expect(result.length).to.equal(2);
            expect(result).to.deep.equal(mockBookings);
        });

        it('should throw an error when DAO fails', async () => {
            const error = new Error('Database connection failed');
            mockBookingDao.getAllBookings.rejects(error);

            try {
                await bookingController.getAllBookings();
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to get all bookings: Database connection failed');
            }
        });

        it('should return empty array when no bookings exist', async () => {
            mockBookingDao.getAllBookings.resolves([]);

            const result = await bookingController.getAllBookings();

            expect(result).to.be.an('array').that.is.empty;
        });
    });

    describe('getBookingById', () => {
        it('should return booking when found', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            mockBookingDao.getBookingById.resolves(mockBooking);

            const result = await bookingController.getBookingById(bookingId);

            expect(mockBookingDao.getBookingById.calledOnceWith(bookingId)).to.be.true;
            expect(result).to.deep.equal(mockBooking);
        });

        it('should return null when booking not found', async () => {
            const bookingId = 'nonexistent';
            mockBookingDao.getBookingById.resolves(null);

            const result = await bookingController.getBookingById(bookingId);

            expect(mockBookingDao.getBookingById.calledOnceWith(bookingId)).to.be.true;
            expect(result).to.be.null;
        });

        it('should throw an error when DAO fails', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const error = new Error('Database error');
            mockBookingDao.getBookingById.rejects(error);

            try {
                await bookingController.getBookingById(bookingId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to get booking by ID: Database error');
            }
        });
    });

    describe('getBookingsByUserId', () => {
        it('should return bookings for specific user', async () => {
            const userId = 'user123';
            const userBookings = [mockBooking];
            mockBookingDao.getBookingsByUserId.resolves(userBookings);

            const result = await bookingController.getBookingsByUserId(userId);

            expect(mockBookingDao.getBookingsByUserId.calledOnceWith(userId)).to.be.true;
            expect(result).to.deep.equal(userBookings);
        });

        it('should return empty array when user has no bookings', async () => {
            const userId = 'user456';
            mockBookingDao.getBookingsByUserId.resolves([]);

            const result = await bookingController.getBookingsByUserId(userId);

            expect(result).to.be.an('array').that.is.empty;
        });

        it('should throw an error when DAO fails', async () => {
            const userId = 'user123';
            const error = new Error('Database error');
            mockBookingDao.getBookingsByUserId.rejects(error);

            try {
                await bookingController.getBookingsByUserId(userId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to get bookings by user ID: Database error');
            }
        });
    });

    describe('getBookingsByDate', () => {
        it('should return bookings for specific date', async () => {
            const date = '2025-10-20';
            const dateBookings = [mockBooking];
            mockBookingDao.getBookingsByDate.resolves(dateBookings);

            const result = await bookingController.getBookingsByDate(date);

            expect(mockBookingDao.getBookingsByDate.calledOnceWith(date)).to.be.true;
            expect(result).to.deep.equal(dateBookings);
        });

        it('should return empty array when no bookings on date', async () => {
            const date = '2025-12-25';
            mockBookingDao.getBookingsByDate.resolves([]);

            const result = await bookingController.getBookingsByDate(date);

            expect(result).to.be.an('array').that.is.empty;
        });

        it('should throw an error when DAO fails', async () => {
            const date = '2025-10-20';
            const error = new Error('Invalid date format');
            mockBookingDao.getBookingsByDate.rejects(error);

            try {
                await bookingController.getBookingsByDate(date);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to get bookings by date: Invalid date format');
            }
        });
    });

    describe('getBookingsByStatus', () => {
        it('should return bookings with specific status', async () => {
            const status = 'pending';
            const statusBookings = [mockBooking];
            mockBookingDao.getBookingsByStatus.resolves(statusBookings);

            const result = await bookingController.getBookingsByStatus(status);

            expect(mockBookingDao.getBookingsByStatus.calledOnceWith(status)).to.be.true;
            expect(result).to.deep.equal(statusBookings);
        });

        it('should return empty array when no bookings with status', async () => {
            const status = 'cancelled';
            mockBookingDao.getBookingsByStatus.resolves([]);

            const result = await bookingController.getBookingsByStatus(status);

            expect(result).to.be.an('array').that.is.empty;
        });

        it('should throw an error when DAO fails', async () => {
            const status = 'pending';
            const error = new Error('Database error');
            mockBookingDao.getBookingsByStatus.rejects(error);

            try {
                await bookingController.getBookingsByStatus(status);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to get bookings by status: Database error');
            }
        });
    });

    describe('createBooking', () => {
        const validBookingData = {
            userId: 'user123',
            groupName: 'Test Group',
            groupType: 'Family',
            groupSize: 5,
            date: '2025-10-20',
            role: 'customer',
            interests: ['Stars'],
            otherInfo: 'Test info'
        };

        it('should create booking with valid data', async () => {
            mockBookingDao.createBooking.resolves(mockBooking);

            const result = await bookingController.createBooking(validBookingData);

            expect(mockBookingDao.createBooking.calledOnceWith(validBookingData)).to.be.true;
            expect(result).to.deep.equal(mockBooking);
        });

        it('should throw error when userId is missing', async () => {
            const invalidData = { ...validBookingData };
            delete invalidData.userId;

            try {
                await bookingController.createBooking(invalidData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create booking: Missing required booking fields');
            }
        });

        it('should throw error when groupName is missing', async () => {
            const invalidData = { ...validBookingData };
            delete invalidData.groupName;

            try {
                await bookingController.createBooking(invalidData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create booking: Missing required booking fields');
            }
        });

        it('should throw error when groupType is missing', async () => {
            const invalidData = { ...validBookingData };
            delete invalidData.groupType;

            try {
                await bookingController.createBooking(invalidData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create booking: Missing required booking fields');
            }
        });

        it('should throw error when groupSize is missing', async () => {
            const invalidData = { ...validBookingData };
            delete invalidData.groupSize;

            try {
                await bookingController.createBooking(invalidData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create booking: Missing required booking fields');
            }
        });

        it('should throw error when date is missing', async () => {
            const invalidData = { ...validBookingData };
            delete invalidData.date;

            try {
                await bookingController.createBooking(invalidData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create booking: Missing required booking fields');
            }
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Validation failed');
            mockBookingDao.createBooking.rejects(error);

            try {
                await bookingController.createBooking(validBookingData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to create booking: Validation failed');
            }
        });
    });

    describe('updateBooking', () => {
        const updateData = { status: 'confirmed', groupSize: 6 };

        it('should update booking when it exists', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const updatedBooking = { ...mockBooking, ...updateData };
            mockBookingDao.updateBooking.resolves(updatedBooking);

            const result = await bookingController.updateBooking(bookingId, updateData);

            expect(mockBookingDao.updateBooking.calledOnceWith(bookingId, updateData)).to.be.true;
            expect(result).to.deep.equal(updatedBooking);
        });

        it('should return null when booking not found', async () => {
            const bookingId = 'nonexistent';
            mockBookingDao.updateBooking.resolves(null);

            const result = await bookingController.updateBooking(bookingId, updateData);

            expect(mockBookingDao.updateBooking.calledOnceWith(bookingId, updateData)).to.be.true;
            expect(result).to.be.null;
        });

        it('should throw error when DAO fails', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const error = new Error('Update failed');
            mockBookingDao.updateBooking.rejects(error);

            try {
                await bookingController.updateBooking(bookingId, updateData);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to update booking: Update failed');
            }
        });
    });

    describe('updateBookingStatus', () => {
        it('should update booking status with valid status', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const status = 'confirmed';
            const updatedBooking = { ...mockBooking, status };
            mockBookingDao.updateBooking.resolves(updatedBooking);

            const result = await bookingController.updateBookingStatus(bookingId, status);

            expect(mockBookingDao.updateBooking.calledOnceWith(bookingId, { status })).to.be.true;
            expect(result).to.deep.equal(updatedBooking);
        });

        it('should return null when booking not found', async () => {
            const bookingId = 'nonexistent';
            const status = 'confirmed';
            mockBookingDao.updateBooking.resolves(null);

            const result = await bookingController.updateBookingStatus(bookingId, status);

            expect(result).to.be.null;
        });

        it('should throw error for invalid status', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const invalidStatus = 'invalid';

            try {
                await bookingController.updateBookingStatus(bookingId, invalidStatus);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to update booking status: Invalid status. Must be pending, confirmed, cancelled, or completed');
            }
        });

        it('should accept all valid statuses', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
            
            for (const status of validStatuses) {
                const updatedBooking = { ...mockBooking, status };
                mockBookingDao.updateBooking.resolves(updatedBooking);

                const result = await bookingController.updateBookingStatus(bookingId, status);
                expect(result.status).to.equal(status);
            }
        });

        it('should throw error when DAO fails', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const status = 'confirmed';
            const error = new Error('Database error');
            mockBookingDao.updateBooking.rejects(error);

            try {
                await bookingController.updateBookingStatus(bookingId, status);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to update booking status: Database error');
            }
        });
    });

    describe('deleteBooking', () => {
        it('should delete booking when it exists', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            mockBookingDao.deleteBooking.resolves(mockBooking);

            const result = await bookingController.deleteBooking(bookingId);

            expect(mockBookingDao.deleteBooking.calledOnceWith(bookingId)).to.be.true;
            expect(result).to.deep.equal(mockBooking);
        });

        it('should return null when booking not found', async () => {
            const bookingId = 'nonexistent';
            mockBookingDao.deleteBooking.resolves(null);

            const result = await bookingController.deleteBooking(bookingId);

            expect(mockBookingDao.deleteBooking.calledOnceWith(bookingId)).to.be.true;
            expect(result).to.be.null;
        });

        it('should throw error when DAO fails', async () => {
            const bookingId = '507f1f77bcf86cd799439011';
            const error = new Error('Delete failed');
            mockBookingDao.deleteBooking.rejects(error);

            try {
                await bookingController.deleteBooking(bookingId);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to delete booking: Delete failed');
            }
        });
    });

    describe('getAvailableDates', () => {
        const startDate = '2025-10-15';
        const endDate = '2025-10-25';

        it('should return booked dates within date range', async () => {
            const bookingsInRange = [
                { ...mockBooking, date: '2025-10-20' },
                { ...mockBooking, date: '2025-10-22' },
                { ...mockBooking, date: '2025-10-30' } // Outside range
            ];
            mockBookingDao.getAllBookings.resolves(bookingsInRange);

            const result = await bookingController.getAvailableDates(startDate, endDate);

            expect(mockBookingDao.getAllBookings.calledOnce).to.be.true;
            expect(result).to.deep.equal(['2025-10-20', '2025-10-22']);
        });

        it('should return empty array when no bookings in range', async () => {
            const bookingsOutsideRange = [
                { ...mockBooking, date: '2025-10-10' }, // Before range
                { ...mockBooking, date: '2025-11-01' }  // After range
            ];
            mockBookingDao.getAllBookings.resolves(bookingsOutsideRange);

            const result = await bookingController.getAvailableDates(startDate, endDate);

            expect(result).to.be.an('array').that.is.empty;
        });

        it('should handle edge dates correctly', async () => {
            const edgeBookings = [
                { ...mockBooking, date: '2025-10-15' }, // Start date
                { ...mockBooking, date: '2025-10-25' }  // End date
            ];
            mockBookingDao.getAllBookings.resolves(edgeBookings);

            const result = await bookingController.getAvailableDates(startDate, endDate);

            expect(result).to.deep.equal(['2025-10-15', '2025-10-25']);
        });

        it('should throw error when DAO fails', async () => {
            const error = new Error('Database error');
            mockBookingDao.getAllBookings.rejects(error);

            try {
                await bookingController.getAvailableDates(startDate, endDate);
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).to.equal('Failed to get available dates: Database error');
            }
        });

        it('should handle invalid date formats gracefully', async () => {
            const invalidStartDate = 'invalid-date';
            const validEndDate = '2025-10-25';
            
            mockBookingDao.getAllBookings.resolves([mockBooking]);

            const result = await bookingController.getAvailableDates(invalidStartDate, validEndDate);

            // Should not crash, but may return unexpected results
            expect(result).to.be.an('array');
        });
    });
});