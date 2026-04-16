import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    username: String,
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    ipAddress: String,
    deviceType: String,
    userAgent: String,
    loginTime: {
      type: Date,
      default: Date.now,
    },
    lastActivityTime: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-expire sessions after 30 days (7 days JWT expiry + buffer)
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Session', sessionSchema);
