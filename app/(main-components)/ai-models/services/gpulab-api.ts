import { ModelConfig, ResourceConfig } from './deployment';

export interface GPULabModel {
  id: number;
  name: string;
  image_name: string;
  author_url: string;
  category_id: number;
  min_vram: number;
  isVisible: boolean;
  container_port: string;
  container_disk: number;
  volume_disk: number;
  volume_mount_path: string;
  docker_command: string;
  env_vars: Record<string, string>;
  readme: string;
}

export interface GPULabContainer {
  model_id: number;
  gpu_count: number;
  gpu_type: string;
  volume_container_identifier?: string;
  existing_container_address?: string;
}

export interface GPULabVolume {
  template_name: string;
  volume_space: number;
  unit?: string;
  region_type?: string;
}

export interface GPULabResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class GPULabAPI {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<GPULabResponse<T>> {
    try {
      console.log('Making request to:', endpoint);
      console.log('Request options:', {
        ...options,
        headers: {
          ...options.headers,
          'api-key': '***' // Hide actual key in logs
        }
      });

      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Request failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  // Model Management
  static async createModel(model: GPULabModel) {
    return this.makeRequest('/api/model', {
      method: 'POST',
      body: JSON.stringify(model),
    });
  }

  static async deleteModel(identifier: string) {
    return this.makeRequest(`/api/model?identifier=${identifier}`, {
      method: 'DELETE',
    });
  }

  static async listModels() {
    return this.makeRequest('/api/models');
  }

  // Container Management
  static async deployContainer(container: GPULabContainer) {
    return this.makeRequest('/api/container', {
      method: 'POST',
      body: JSON.stringify(container),
    });
  }

  static async getContainerStatus(containerId: string) {
    return this.makeRequest(`/api/container?container_id=${containerId}`);
  }

  static async deleteContainer(address: string) {
    return this.makeRequest('/api/container', {
      method: 'DELETE',
      body: JSON.stringify({ address }),
    });
  }

  // Network Volume Management
  static async createVolume(volume: GPULabVolume) {
    return this.makeRequest('/api/nas-server', {
      method: 'POST',
      body: JSON.stringify(volume),
    });
  }

  static async deleteVolume(identifier: string) {
    return this.makeRequest(`/api/nas-server?identifier=${identifier}`, {
      method: 'DELETE',
    });
  }

  // Helper method to deploy a custom model
  static async deployCustomModel(
    file: File,
    modelConfig: ModelConfig,
    resourceConfig: ResourceConfig
  ) {
    try {
      // 1. Create model
      const modelResponse = await this.createModel({
        name: file.name,
        image_name: modelConfig.baseImage,
        author_url: window.location.origin,
        category_id: 1,
        min_vram: 4,
        isVisible: true,
        container_port: modelConfig.ports.join(','),
        container_disk: 20,
        volume_disk: 50,
        volume_mount_path: modelConfig.volumes[0],
        docker_command: 'python app.py',
        env_vars: {},
        readme: `Framework: ${modelConfig.framework}\nDependencies: ${modelConfig.dependencies.join(', ')}`
      });

      if (!modelResponse.success) {
        throw new Error(modelResponse.error || 'Failed to create model');
      }

      // 2. Create volume
      const volumeResponse = await this.createVolume({
        template_name: `${file.name}-volume`,
        volume_space: 100,
        unit: 'GB'
      });

      if (!volumeResponse.success) {
        throw new Error(volumeResponse.error || 'Failed to create volume');
      }

      // 3. Deploy container
      const containerResponse = await this.deployContainer({
        model_id: modelResponse.data.id,
        gpu_count: resourceConfig.gpu || 1,
        gpu_type: 'NVIDIA GeForce RTX 3090 Ti',
        volume_container_identifier: volumeResponse.data.volume_server_identifier
      });

      if (!containerResponse.success) {
        throw new Error(containerResponse.error || 'Failed to deploy container');
      }

      // 4. Check container status
      const statusResponse = await this.getContainerStatus(containerResponse.data.container_id);
      if (!statusResponse.success || statusResponse.data.container_stats.status !== 'running') {
        throw new Error('Container failed to start');
      }

      return {
        success: true,
        endpoint: containerResponse.data.public_urls?.[0],
        containerId: containerResponse.data.container_id
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
