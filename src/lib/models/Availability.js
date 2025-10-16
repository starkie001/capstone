import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['hosting', 'obs']
    },
    userId: {
        type: String,
        required: true
    },
    dates: {
        type: [String],
        default: []
    },
    role: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for id to match existing API
AvailabilitySchema.virtual('id').get(function() {
    return this._id.toString();
});

// Indexes
AvailabilitySchema.index({ type: 1, userId: 1 });

export default mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);