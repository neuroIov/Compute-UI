import React from 'react';
import { Cpu, HardDrive, Network } from 'lucide-react';

interface ResourceConfig {
  gpuMemory: string;
  cpuLimit: string;
  networkTier: string;
  autoScaling: boolean;
  monitoring: boolean;
}

interface ResourceConfigFormProps {
  config: ResourceConfig;
  onUpdate: (config: ResourceConfig) => void;
}

export const ResourceConfigForm: React.FC<ResourceConfigFormProps> = ({ config, onUpdate }) => {
  return (
    <div className="space-y-4">
      {/* GPU Configuration */}
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <HardDrive className="w-5 h-5 mr-2" />
          GPU Resources
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">GPU Memory Limit</label>
            <select
              className="w-full bg-black/30 text-white p-2 rounded text-sm"
              value={config.gpuMemory}
              onChange={(e) => onUpdate({ ...config, gpuMemory: e.target.value })}
            >
              <option value="10">10% - 2GB VRAM (Development)</option>
              <option value="25">25% - 5GB VRAM (Testing)</option>
              <option value="40">40% - 8GB VRAM (Production)</option>
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">CPU Allocation</label>
            <select
              className="w-full bg-black/30 text-white p-2 rounded text-sm"
              value={config.cpuLimit}
              onChange={(e) => onUpdate({ ...config, cpuLimit: e.target.value })}
            >
              <option value="0.5">0.5 CPU Cores</option>
              <option value="1">1 CPU Core</option>
              <option value="2">2 CPU Cores</option>
              <option value="4">4 CPU Cores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <Network className="w-5 h-5 mr-2" />
          Network Configuration
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Network Tier</label>
            <select
              className="w-full bg-black/30 text-white p-2 rounded text-sm"
              value={config.networkTier}
              onChange={(e) => onUpdate({ ...config, networkTier: e.target.value })}
            >
              <option value="standard">Standard - Up to 1 Gbps</option>
              <option value="premium">Premium - Up to 10 Gbps</option>
              <option value="ultra">Ultra - Up to 100 Gbps</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2" />
          Advanced Settings
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-scaling"
              checked={config.autoScaling}
              onChange={(e) => onUpdate({ ...config, autoScaling: e.target.checked })}
              className="mr-3"
            />
            <label htmlFor="auto-scaling" className="text-gray-400 text-sm">
              Enable Auto-scaling
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="monitoring"
              checked={config.monitoring}
              onChange={(e) => onUpdate({ ...config, monitoring: e.target.checked })}
              className="mr-3"
            />
            <label htmlFor="monitoring" className="text-gray-400 text-sm">
              Enable GPU Monitoring
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
