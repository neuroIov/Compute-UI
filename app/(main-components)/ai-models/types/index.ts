// Model Types
export interface ModelConfig {
  framework: string;
  name: string;
  version: string;
  description?: string;
  requirements?: string[];
}

export interface ResourceConfig {
  gpu: string;
  memory: string;
  storage: string;
}

export interface DeploymentConfig {
  model: ModelConfig;
  resources: ResourceConfig;
}

// GPULab Types
export interface GPULabResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GPULabModel {
  id: number;
  name: string;
  container_address: string;
  container_status: string;
  public_urls: string[];
  opened_ports: string;
  created_at: string;
  gpus: GPULabGPU[];
}

export interface GPULabGPU {
  gpu_type: string;
  mem_used_percent: number;
  gpu_status: boolean;
  gpuprice: string;
}

// Container Types
export interface ContainerStats {
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

// Marketplace Types
export interface MarketplaceModel {
  id: string;
  name: string;
  description: string;
  framework: string;
  version: string;
  price: number;
  category: string;
  tags: string[];
  publisher: string;
  ratings: number;
  downloads: number;
}
