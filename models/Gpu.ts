import mongoose from 'mongoose';

const gpuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'GPU name is required'],
    trim: true,
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true,
  },
  memorySize: {
    type: Number,
    required: [true, 'Memory size is required'],
  },
  memoryType: {
    type: String,
    required: [true, 'Memory type is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

export default mongoose.models.Gpu || mongoose.model('Gpu', gpuSchema);
