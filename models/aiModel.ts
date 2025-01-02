import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'AI Model name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['image', 'api', 'agent', 'video', 'ml', 'text', '3d', 'realtime', 'audio'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  minGpuMemory: {
    type: Number,
    required: [true, 'Minimum GPU memory requirement is required'],
  },
  recommendedGpuMemory: {
    type: Number,
    required: false,
  },
  tags: [{
    type: String,
    enum: ['Premium', 'Fast', 'Efficient', 'Advanced', 'High-Quality', 'Open Source', 'Flexible', 'Scalable', 'High-Performance', 'Low-Latency', 'High-Fidelity']
  }],
  icon: {
    type: String,
    required: [true, 'Icon is required'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Method to check GPU compatibility
aiModelSchema.methods.isCompatibleWithGpu = function(gpuMemorySize: number) {
  return gpuMemorySize >= this.minGpuMemory;
};

const AiModel = mongoose.models.AiModel || mongoose.model('AiModel', aiModelSchema);
export default AiModel;
