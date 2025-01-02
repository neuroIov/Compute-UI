import React, { useEffect, useState } from 'react';
import { GPULabAPI } from '../services/gpulab-api';
import { Activity, Box, Cpu, HardDrive, RefreshCw } from 'lucide-react';

interface ContainerStats {
  cpu_usage: string;
  ram_usage: string;
  total_ram: string;
  ram_percentage: string;
  status: string;
  used_volume: string;
  used_container_disk: string;
  uptime: string;
  created: string;
  total_volume: string;
  total_container_disk: string;
  used_container_disk_percentage: string;
  used_volume_percentage: string;
}

interface GPUStats {
  memory_used: number;
  total_memory: number;
  mem_utilize_percent: string;
}

interface DeployedModel {
  id: number;
  name: string;
  container_address: string;
  container_status: string;
  public_urls: string[];
  opened_ports: string;
  created_at: string;
  gpus: {
    gpu_type: string;
    mem_used_percent: number;
    gpu_status: boolean;
    gpuprice: string;
  }[];
}

export function StatusDashboard() {
  const [deployedModels, setDeployedModels] = useState<DeployedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeployedModels = async () => {
    try {
      setRefreshing(true);
      const response = await GPULabAPI.listModels();
      if (response.success && response.data) {
        setDeployedModels(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch models');
      }
    } catch (err) {
      setError('Failed to fetch deployed models');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeployedModels();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDeployedModels, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-[#1a1a1a] rounded-xl p-6 shadow-xl border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-400" />
          Deployment Status
        </h2>
        <button
          onClick={() => fetchDeployedModels()}
          disabled={refreshing}
          className={`p-2 rounded-lg transition-all duration-200 ${
            refreshing 
              ? 'bg-blue-500/10 text-blue-400'
              : 'hover:bg-blue-500/10 text-gray-400 hover:text-blue-400'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {deployedModels.length === 0 ? (
          <div className="text-center py-8">
            <Box className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No deployed models found</p>
          </div>
        ) : (
          deployedModels.map((model) => (
            <div
              key={model.id}
              className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-medium text-white mb-1">{model.name}</h3>
                  <p className="text-gray-400 text-sm">Created {new Date(model.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  model.container_status === 'running'
                    ? 'bg-green-500/20 text-green-400'
                    : model.container_status === 'stopped'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {model.container_status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">Container:</span>
                  <span className="text-gray-300 font-mono">{model.container_address}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">Ports:</span>
                  <span className="text-gray-300">{model.opened_ports}</span>
                </div>
              </div>

              <div className="space-y-3">
                {model.gpus.map((gpu, index) => (
                  <div key={index} className="bg-black/30 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">{gpu.gpu_type}</span>
                      <span className="text-blue-400">{gpu.gpuprice}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Memory Usage</span>
                          <span className="text-gray-300">{gpu.mem_used_percent}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${gpu.mem_used_percent}%` }}
                          />
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        gpu.gpu_status ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              {model.public_urls && model.public_urls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-gray-400 mb-2">Public URLs:</h4>
                  <div className="space-y-2">
                    {model.public_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 transition-colors text-sm"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
