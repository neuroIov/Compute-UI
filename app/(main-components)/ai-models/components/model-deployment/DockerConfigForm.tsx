import React from 'react';
import { Box, Container, Server } from 'lucide-react';

interface ModelConfig {
  framework: string;
  baseImage: string;
  dependencies: string[];
  ports: string[];
  volumes: string[];
}

interface DockerConfigFormProps {
  modelConfig: ModelConfig;
  onUpdate: (config: ModelConfig) => void;
  onNext: () => void;
}

export const DockerConfigForm: React.FC<DockerConfigFormProps> = ({
  modelConfig,
  onUpdate,
  onNext
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...modelConfig,
      baseImage: e.target.value
    });
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...modelConfig,
      ports: [e.target.value]
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...modelConfig,
      volumes: [e.target.value]
    });
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-white font-medium mb-4 flex items-center">
        <Container className="w-5 h-5 mr-2" />
        Docker Configuration
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Base Image Selection */}
        <div>
          <label className="text-gray-300 text-sm block mb-2">Base Image</label>
          <select
            value={modelConfig.baseImage}
            onChange={handleImageChange}
            className="w-full bg-[#222] text-white rounded p-2 border border-gray-700/50"
          >
            <option value="pytorch/pytorch:2.0.0-cuda11.7-cudnn8-runtime">PyTorch 2.0.0 (CUDA 11.7)</option>
            <option value="tensorflow/tensorflow:2.13.0-gpu">TensorFlow 2.13.0 (GPU)</option>
            <option value="nvidia/cuda:11.8.0-runtime-ubuntu22.04">NVIDIA CUDA 11.8.0</option>
          </select>
        </div>

        {/* Port Mapping */}
        <div>
          <label className="text-gray-300 text-sm block mb-2">Port Mapping</label>
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={modelConfig.ports[0]}
              onChange={handlePortChange}
              placeholder="8000:8000"
              className="flex-1 bg-[#222] text-white rounded p-2 border border-gray-700/50"
            />
          </div>
        </div>

        {/* Volume Mount */}
        <div>
          <label className="text-gray-300 text-sm block mb-2">Volume Mount</label>
          <div className="flex items-center space-x-2">
            <Box className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={modelConfig.volumes[0]}
              onChange={handleVolumeChange}
              placeholder="/model-data"
              className="flex-1 bg-[#222] text-white rounded p-2 border border-gray-700/50"
            />
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <label className="text-gray-300 text-sm block mb-2">Dependencies</label>
          <div className="bg-[#222] rounded p-2 border border-gray-700/50 h-[38px] overflow-y-auto">
            <div className="text-gray-400 text-sm">
              {modelConfig.dependencies[0]} + {modelConfig.dependencies.length - 1} more
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next: Configure Resources
        </button>
      </div>
    </div>
  );
};
