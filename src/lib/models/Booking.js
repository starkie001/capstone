import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    role: {
        type: String,
        required: true
    },
    groupName: {
        type: String,
        required: [true, 'Group name is required'],
        trim: true
    },
    groupType: {
        type: String,
        required: [true, 'Group type is required'],
        enum: ['Family', 'School', 'Club', 'Business', 'Member', 'Other']
    },
    groupSize: {
        type: Number,
        required: [true, 'Group size is required'],
        min: 1
    },
    interests: {
        type: [String],
        default: []
    },
    otherInfo: {
        type: String,
        default: '',
        trim: true
    },
    date: {
        type: String,
        required: [true, 'Date is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: { createdAt: 'created', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for id to match existing API
BookingSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Indexes
BookingSchema.index({ userId: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ status: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);