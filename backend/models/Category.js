import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bob: {
      type: Number,
      required: true,
      default: 0,
    },
    excise: {
      type: Number,
      required: true,
      default: 0,
    },
    basic: {
      type: Number,
      required: true,
      default: 0,
    },
    pmt: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
