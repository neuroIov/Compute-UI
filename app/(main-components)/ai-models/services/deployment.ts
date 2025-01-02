export interface ModelConfig {
  framework: string;
  baseImage: string;
  dependencies: string[];
  ports: string[];
  volumes: string[];
}

export interface ResourceConfig {
  gpuMemory: string;
  cpuLimit: string;
  networkTier: string;
  autoScaling: boolean;
  monitoring: boolean;
}

export interface DeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  message?: string;
}

export async function analyzeModel(file: File): Promise<ModelConfig> {
  console.log('Starting model analysis for file:', file.name);
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  console.log('File extension:', extension);
  
  if (!['h5', 'pkl', 'pt', 'pth', 'onnx', 'pb', 'bin'].includes(extension)) {
    throw new Error(`Unsupported file format: ${extension}. Please upload a supported model file.`);
  }

  // Check file size
  const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds 10GB limit. Your file: ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`);
  }

  // Map file extensions to frameworks
  let framework = 'Unknown';
  let baseImage = 'nvidia/cuda:11.8.0-runtime-ubuntu22.04';
  
  // Detect framework from filename and extension
  if (file.name.toLowerCase().includes('pytorch') || ['pt', 'pth', 'bin'].includes(extension)) {
    framework = 'PyTorch';
    baseImage = 'pytorch/pytorch:2.0.0-cuda11.7-cudnn8-runtime';
  } else if (file.name.toLowerCase().includes('tensorflow') || ['h5', 'pb'].includes(extension)) {
    framework = 'TensorFlow';
    baseImage = 'tensorflow/tensorflow:2.13.0-gpu';
  } else if (extension === 'onnx') {
    framework = 'ONNX';
    baseImage = 'nvidia/cuda:11.8.0-runtime-ubuntu22.04';
  }

  console.log('Detected framework:', framework);
  console.log('Selected base image:', baseImage);

  if (framework === 'Unknown') {
    throw new Error('Could not determine the AI framework. Please ensure your model file is from PyTorch, TensorFlow, or ONNX.');
  }

  // Generate appropriate configuration
  const config: ModelConfig = {
    framework,
    baseImage,
    dependencies: [
      framework === 'PyTorch' ? 'torch==2.0.0' :
      framework === 'TensorFlow' ? 'tensorflow==2.13.0' :
      'onnxruntime-gpu==1.15.1',
      'numpy==1.24.3',
      'flask==2.0.1'
    ],
    ports: ['8000:8000'],
    volumes: ['/model-data']
  };

  // Add framework-specific dependencies
  if (framework === 'PyTorch') {
    config.dependencies.push('torchvision==0.15.0');
  }

  return config;
}

export async function deployModel(
  file: File,
  modelConfig: ModelConfig,
  resourceConfig: ResourceConfig,
  onProgress: (steps: DeploymentStep[]) => void
): Promise<{ success: boolean; endpoint?: string; error?: string }> {
  const steps: DeploymentStep[] = [
    { id: 'analyze', name: 'Analyzing Model', status: 'pending' },
    { id: 'build', name: 'Building Docker Image', status: 'pending' },
    { id: 'configure', name: 'Configuring Resources', status: 'pending' },
    { id: 'deploy', name: 'Deploying Container', status: 'pending' }
  ];

  try {
    // 1. Upload Model
    updateStep(steps, 'analyze', 'in-progress');
    onProgress(steps);
    
    // Create model using GPULab API
    const modelResponse = await fetch('/api/model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        image_name: modelConfig.baseImage,
        author_url: window.location.origin,
        category_id: 1, // Default category
        min_vram: 4, // Default minimum VRAM
        isVisible: true,
        container_port: modelConfig.ports.join(','),
        container_disk: 20, // Default 20GB
        volume_disk: 50, // Default 50GB
        volume_mount_path: modelConfig.volumes[0],
        docker_command: 'python app.py',
        env_vars: {},
        readme: `Framework: ${modelConfig.framework}\nDependencies: ${modelConfig.dependencies.join(', ')}`
      })
    });

    const modelResult = await modelResponse.json();
    if (!modelResult.success) {
      throw new Error(modelResult.error || 'Failed to create model');
    }

    updateStep(steps, 'analyze', 'completed');
    onProgress(steps);

    // 2. Create Network Volume
    updateStep(steps, 'build', 'in-progress');
    onProgress(steps);

    const volumeResponse = await fetch('/api/nas-server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_name: `${file.name}-volume`,
        volume_space: 100,
        unit: 'GB'
      })
    });

    const volumeResult = await volumeResponse.json();
    if (!volumeResult.success) {
      throw new Error(volumeResult.error || 'Failed to create network volume');
    }

    updateStep(steps, 'build', 'completed');
    onProgress(steps);

    // 3. Deploy Container
    updateStep(steps, 'configure', 'in-progress');
    onProgress(steps);

    const containerResponse = await fetch('/api/container', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: modelResult.id,
        gpu_count: resourceConfig.gpu || 1,
        gpu_type: 'NVIDIA GeForce RTX 3090 Ti',
        volume_container_identifier: volumeResult.volume_server_identifier
      })
    });

    const containerResult = await containerResponse.json();
    if (!containerResult.success) {
      throw new Error(containerResult.error || 'Failed to deploy container');
    }

    updateStep(steps, 'configure', 'completed');
    onProgress(steps);

    // 4. Final Deployment Steps
    updateStep(steps, 'deploy', 'in-progress');
    onProgress(steps);

    // Wait for container to be ready
    const containerInfo = await fetch(`/api/container?container_id=${containerResult.container_id}`);
    const containerStatus = await containerInfo.json();

    if (containerStatus.container_stats.status !== 'running') {
      throw new Error('Container failed to start');
    }

    updateStep(steps, 'deploy', 'completed');
    onProgress(steps);

    return {
      success: true,
      endpoint: containerResult.public_urls?.[0]
    };

  } catch (error) {
    const failedStep = steps.find(step => step.status === 'in-progress');
    if (failedStep) {
      updateStep(steps, failedStep.id, 'failed', error.message);
      onProgress(steps);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

function updateStep(
  steps: DeploymentStep[],
  stepId: string,
  status: DeploymentStep['status'],
  message?: string
) {
  const step = steps.find(s => s.id === stepId);
  if (step) {
    step.status = status;
    if (message) {
      step.message = message;
    }
  }
}

function simulateStep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
