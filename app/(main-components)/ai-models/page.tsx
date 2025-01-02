'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterMenu } from '@/components/FilterMenu';
import { Heart, Image as ImageIcon, Zap, Box, Video, Brain, MessageSquare, Music, Clock, X, Upload, Plus } from 'lucide-react';
import { DockerConfigForm } from './components/model-deployment/DockerConfigForm';
import { ResourceConfigForm } from './components/model-deployment/ResourceConfigForm';
import { ModelAnalysis } from './components/model-deployment/ModelAnalysis';
import { deployModel, analyzeModel } from './services/deployment';
import { AddToCartButton } from '@/app/(secondary-components)/cart/AddToCartButton';
import { StatusDashboard } from './components/StatusDashboard';
import { GPULabConnection } from './components/GPULabConnection';

interface ModelConfig {
  framework: string;
  baseImage: string;
  dependencies: string[];
  ports: number[];
  volumes: string[];
}

interface ResourceConfig {
  cpu: number;
  memory: number;
  gpu: number;
  autoScaling: boolean;
  monitoring: boolean;
}

const filterOptions = {
  generation: {
    name: "Generation",
    filters: ["Text", "Image", "Video", "3D", "Audio", "Real-time"]
  },
  type: {
    name: "Type",
    filters: ["Open Source", "Closed Source"]
  },
  sort: {
    name: "Sort by",
    filters: ["Newest", "Price: Low to High", "Price: High to Low"]
  }
};

const containerOptions = [
  {
    id: 'basic',
    name: 'Basic',
    gpuUsage: '10%',
    price: 50,
    description: 'Suitable for small-scale inference and testing'
  },
  {
    id: 'standard',
    name: 'Standard',
    gpuUsage: '25%',
    price: 100,
    description: 'Ideal for medium workloads and development'
  },
  {
    id: 'premium',
    name: 'Premium',
    gpuUsage: '40%',
    price: 150,
    description: 'Best for production and high-performance needs'
  }
];

const models = [
  {
    id: '1',
    name: 'Flux Image Gen',
    description: 'High-performance image generation and manipulation',
    icon: ImageIcon,
    price: 8,
    type: 'image',
    tags: ['Premium', 'Fast']
  },
  {
    id: '2',
    name: 'Fast API',
    description: 'High-speed API development and deployment',
    icon: Zap,
    price: 5,
    type: 'api',
    tags: ['Fast', 'Efficient']
  },
  {
    id: '3',
    name: 'AI Super Agents',
    description: 'Advanced autonomous AI agents for complex tasks',
    icon: Brain,
    price: 12,
    type: 'agent',
    tags: ['Premium', 'Advanced']
  },
  {
    id: '4',
    name: 'Deepfake',
    description: 'Advanced video synthesis and manipulation',
    icon: Video,
    price: 15,
    type: 'video',
    tags: ['Premium', 'High-Quality']
  },
  {
    id: '5',
    name: 'PyTorch',
    description: 'Deep learning and neural network training',
    icon: Brain,
    price: 10,
    type: 'ml',
    tags: ['Open Source', 'Flexible']
  },
  {
    id: '6',
    name: 'LLM Server',
    description: 'Large Language Model hosting and inference',
    icon: MessageSquare,
    price: 20,
    type: 'text',
    tags: ['Premium', 'Scalable']
  },
  {
    id: '7',
    name: '3D Server',
    description: '3D model generation and rendering',
    icon: Box,
    price: 18,
    type: '3d',
    tags: ['Premium', 'High-Performance']
  },
  {
    id: '8',
    name: 'Realtime',
    description: 'Real-time AI processing and inference',
    icon: Clock,
    price: 25,
    type: 'realtime',
    tags: ['Premium', 'Low-Latency']
  },
  {
    id: '9',
    name: 'Audio Server',
    description: 'Audio processing and generation',
    icon: Music,
    price: 15,
    type: 'audio',
    tags: ['Premium', 'High-Fidelity']
  }
];

export default function AiModelsPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomModelModal, setShowCustomModelModal] = useState(false);
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [customModelFile, setCustomModelFile] = useState(null);
  const [containerName, setContainerName] = useState('');
  const [resourceAllocation, setResourceAllocation] = useState('2 vCPU / 4GB RAM');
  const [deploymentStep, setDeploymentStep] = useState('upload');
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    framework: '',
    baseImage: 'nvidia/cuda:11.8.0-runtime-ubuntu22.04',
    dependencies: [],
    ports: [],
    volumes: []
  });
  const [resourceConfig, setResourceConfig] = useState<ResourceConfig>({
    cpu: 1,
    memory: 2,
    gpu: 0,
    autoScaling: false,
    monitoring: true
  });
  const [deploymentSteps, setDeploymentSteps] = useState([
    { message: 'Validating model configuration', status: 'pending' },
    { message: 'Building Docker container', status: 'pending' },
    { message: 'Allocating resources', status: 'pending' },
    { message: 'Starting deployment', status: 'pending' }
  ]);
  const [uploadError, setUploadError] = useState('');
  const [wallet, setWallet] = useState({
    usd: 1000000,
    nlov: 999999,
  });
  const [selectedModel, setSelectedModel] = useState(null);
  const [useNLOVDiscount, setUseNLOVDiscount] = useState(false);

  const calculatePrice = (basePrice: number) => {
    if (useNLOVDiscount && wallet.nlov >= 100) { 
      return basePrice * 0.7; 
    }
    return basePrice;
  };

  const handlePayment = async () => {
    const price = calculatePrice(selectedModel?.price || 0);
    
    if (wallet.usd >= price) {
      setWallet(prev => ({
        ...prev,
        usd: prev.usd - price,
        nlov: useNLOVDiscount ? prev.nlov - 100 : prev.nlov
      }));
      
      await handleModelDeploy();
      setShowPaymentModal(false);
    }
  };

  const handleCustomModelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    setUploadError('');
    
    if (file) {
      try {
        console.log('Starting file upload process');
        setCustomModelFile(file);
        setDeploymentStep('analyze');
        
        console.log('Analyzing model...');
        const config = await analyzeModel(file);
        console.log('Analysis result:', config);
        setModelConfig(prevConfig => ({
          ...prevConfig,
          ...config
        }));
      } catch (error) {
        console.error('Error in model upload:', error);
        setUploadError(error.message || 'Failed to analyze model');
        setDeploymentStep('upload');
      }
    }
  };

  const handleModelDeploy = async () => {
    setDeploymentStep('deploy');
    try {
      setDeploymentSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'in-progress' } : step
      ));

      const result = await deployModel(
        customModelFile,
        modelConfig,
        resourceConfig
      );

      setDeploymentSteps(prev => prev.map(step => ({
        ...step,
        status: 'completed'
      })));

      console.log('Deployment result:', result);
    } catch (error) {
      setDeploymentSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === prev.findIndex(s => s.status === 'in-progress') ? 'error' : step.status
      })));
      console.error('Deployment error:', error);
    }
  };

  const handleDeploy = (model: any) => {
    setSelectedModel(model);
    setShowPaymentModal(true);
  };

  const handleContainerSelect = () => {
    setShowContainerModal(false);
    setShowPaymentModal(true);
  };

  const handleContainerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleContainerSelect();
  };

  const closeModals = () => {
    setShowContainerModal(false);
    setShowPaymentModal(false);
    setShowCustomModelModal(false);
    setCustomModelFile(null);
  };

  const renderDeploymentStep = () => {
    switch (deploymentStep) {
      case 'upload':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                id="model-upload"
                className="hidden"
                onChange={handleCustomModelUpload}
                accept=".h5,.pkl,.pt,.pth,.onnx,.pb,.bin"
              />
              <label
                htmlFor="model-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={48} className="text-blue-400 mb-4" />
                <p className="text-white font-medium mb-2">Upload AI Model</p>
                <p className="text-gray-400 text-sm">Supports .h5, .pkl, .pt, .pth, .onnx, .pb, .bin</p>
              </label>
            </div>
            {uploadError && (
              <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg">
                <p className="text-red-400">{uploadError}</p>
              </div>
            )}
            <div className="bg-[#222] p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">Requirements</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Maximum file size: 10GB</li>
                <li>• Supported frameworks: TensorFlow, PyTorch, ONNX</li>
                <li>• Include model configuration file (optional)</li>
              </ul>
            </div>
          </div>
        );

      case 'analyze':
        return (
          <div className="space-y-6">
            <ModelAnalysis modelConfig={modelConfig} />
            <DockerConfigForm 
              modelConfig={modelConfig}
              onUpdate={setModelConfig}
              onNext={() => setDeploymentStep('configure')}
            />
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <ResourceConfigForm
              config={resourceConfig}
              onUpdate={setResourceConfig}
            />
            <div className="flex justify-between">
              <button
                onClick={() => setDeploymentStep('analyze')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleModelDeploy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Deploy Model
              </button>
            </div>
          </div>
        );

      case 'deploy':
        return (
          <div className="space-y-4">
            <div className="bg-[#222] p-4 rounded-lg">
              <h3 className="text-white font-medium mb-4">Deployment Status</h3>
              <div className="space-y-2">
                {deploymentSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      step.status === 'completed' ? 'bg-green-400' :
                      step.status === 'error' ? 'bg-red-400' :
                      step.status === 'in-progress' ? 'bg-blue-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-gray-300">{step.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderPaymentModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-900 to-[#1A1A1A] p-8 rounded-xl w-full max-w-md shadow-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Deploy {selectedModel?.name}
          </h3>
          <button 
            onClick={() => setShowPaymentModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-400">Wallet Balance</span>
            <span className="text-white font-medium text-lg">${wallet.usd.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">$NLOV Tokens</span>
            <span className="text-blue-400 font-medium text-lg">{wallet.nlov.toLocaleString()} NLOV</span>
          </div>
        </div>

        <div className="space-y-5 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Base Price</span>
            <span className="text-white text-lg font-medium">${selectedModel?.price}/hr</span>
          </div>
          
          {wallet.nlov >= 100 && (
            <div className="flex items-center justify-between bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <label className="flex items-center space-x-3 text-gray-300">
                <input
                  type="checkbox"
                  checked={useNLOVDiscount}
                  onChange={(e) => setUseNLOVDiscount(e.target.checked)}
                  className="form-checkbox h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span>Use 100 $NLOV for 30% discount</span>
              </label>
              <span className="text-green-400 font-medium">-30%</span>
            </div>
          )}

          <div className="border-t border-gray-800 pt-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Final Price</span>
              <span className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ${calculatePrice(selectedModel?.price || 0)}/hr
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowPaymentModal(false)}
            className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            Pay & Deploy
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">AI Models</h1>
        <p className="text-gray-400 text-lg">Deploy and manage your AI models with custom configurations</p>
      </div>

      {/* Add GPULab Connection Status */}
      <GPULabConnection />

      <div className="mb-8 flex items-center justify-end space-x-6">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-3 rounded-xl flex items-center space-x-3 shadow-lg">
          <span className="text-gray-400">Balance:</span>
          <span className="text-white font-medium text-lg">${wallet.usd.toLocaleString()}</span>
        </div>
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-3 rounded-xl flex items-center space-x-3 shadow-lg">
          <span className="text-gray-400">$NLOV:</span>
          <span className="text-blue-400 font-medium text-lg">{wallet.nlov.toLocaleString()} NLOV</span>
        </div>
      </div>

      {/* Custom AI Model Upload Section */}
      <div className="bg-gradient-to-b from-gray-900 to-[#1a1a1a] rounded-xl p-8 shadow-xl border border-gray-800 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <Upload className="w-6 h-6 mr-2 text-blue-400" />
          Deploy Custom AI Model
        </h2>
        
        <div className="flex justify-between mb-8">
          {['Upload', 'Configure Docker', 'Set Resources', 'Deploy'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex flex-col items-center ${
                index === ['upload', 'analyze', 'configure', 'deploy'].indexOf(deploymentStep) 
                  ? 'text-blue-400' 
                  : 'text-gray-500'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                  index === ['upload', 'analyze', 'configure', 'deploy'].indexOf(deploymentStep)
                    ? 'bg-blue-400/20 text-blue-400 ring-2 ring-blue-400/50'
                    : 'bg-gray-800'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{step}</span>
              </div>
              {index < 3 && (
                <div className="w-24 h-px bg-gradient-to-r from-gray-800 to-gray-700 mx-4 mt-4" />
              )}
            </div>
          ))}
        </div>

        {renderDeploymentStep()}
      </div>

      {/* Pre-configured Models Section */}
      <div className="bg-gradient-to-b from-gray-900 to-[#1a1a1a] rounded-xl p-8 shadow-xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <Box className="w-6 h-6 mr-2 text-blue-400" />
            Pre-configured Models
          </h2>
        </div>

        {/* Add Status Dashboard */}
        <StatusDashboard />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model.name}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 hover:from-gray-900 hover:to-gray-800 transition-all duration-300 border border-gray-700/50 hover:border-gray-600 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <h3 className="text-white font-medium text-lg group-hover:text-blue-400 transition-colors mb-2">{model.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{model.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {model.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    ${model.price}<span className="text-gray-500">/hr</span>
                  </div>
                  <button
                    onClick={() => handleDeploy(model)}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    Deploy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPaymentModal && renderPaymentModal()}
      {showContainerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[#222] p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Deploy Model
            </h3>
            <p className="text-gray-400 mb-4">
              Configure container settings for your model deployment.
            </p>
            <form onSubmit={handleContainerSubmit} className="space-y-4 mb-6">
              <div>
                <label className="text-gray-300 text-sm block mb-2">
                  Container Name
                </label>
                <input
                  type="text"
                  value={containerName}
                  onChange={(e) => setContainerName(e.target.value)}
                  className="w-full bg-[#333] text-white p-2 rounded"
                  placeholder="my-model-container"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">
                  Resource Allocation
                </label>
                <select 
                  value={resourceAllocation}
                  onChange={(e) => setResourceAllocation(e.target.value)}
                  className="w-full bg-[#333] text-white p-2 rounded"
                >
                  <option>2 vCPU / 4GB RAM</option>
                  <option>4 vCPU / 8GB RAM</option>
                  <option>8 vCPU / 16GB RAM</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowContainerModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
