import React from 'react';
import { FileCode, Package, Server } from 'lucide-react';

interface ModelAnalysisProps {
  modelConfig: {
    framework: string;
    baseImage: string;
    dependencies: string[];
    ports: string[];
    volumes: string[];
  };
}

export const ModelAnalysis: React.FC<ModelAnalysisProps> = ({ modelConfig }) => {
  return (
    <div className="space-y-4">
      {/* Framework Detection */}
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <FileCode className="w-5 h-5 mr-2" />
          Model Analysis
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-400">Detected Framework:</span>
            <span className="ml-2 text-white">{modelConfig.framework}</span>
          </div>
          <div>
            <span className="text-gray-400">Model Format:</span>
            <span className="ml-2 text-white">.h5 (TensorFlow SavedModel)</span>
          </div>
          <div>
            <span className="text-gray-400">Model Size:</span>
            <span className="ml-2 text-white">2.3 GB</span>
          </div>
        </div>
      </div>

      {/* Dependencies */}
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Required Dependencies
        </h3>
        <div className="space-y-2">
          {modelConfig.dependencies.map((dep, index) => (
            <div key={index} className="bg-black/30 p-2 rounded text-sm">
              <code className="text-blue-400">{dep}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Dockerfile */}
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2" />
          Generated Dockerfile
        </h3>
        <pre className="text-sm text-gray-400 bg-black/30 p-3 rounded overflow-x-auto">
          {`FROM ${modelConfig.baseImage}

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    python3-pip \\
    python3-dev \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create model directory
WORKDIR /app
COPY model/ ./model/
COPY serve.py .

# Set environment variables
ENV MODEL_PATH=/app/model
ENV CUDA_VISIBLE_DEVICES=0

# Expose ports
${modelConfig.ports.map(port => `EXPOSE ${port}`).join('\n')}

# Start the model server
CMD ["python3", "serve.py"]`}
        </pre>
      </div>
    </div>
  );
};
