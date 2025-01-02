import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { modelFile, modelConfig, resourceConfig } = data;

    // 1. Save uploaded model file
    const modelDir = path.join(process.cwd(), 'uploads', 'models');
    await fs.mkdir(modelDir, { recursive: true });
    const modelPath = path.join(modelDir, modelFile.name);
    await fs.writeFile(modelPath, Buffer.from(await modelFile.arrayBuffer()));

    // 2. Generate Dockerfile
    const dockerfile = generateDockerfile(modelConfig);
    const dockerfilePath = path.join(modelDir, 'Dockerfile');
    await fs.writeFile(dockerfilePath, dockerfile);

    // 3. Build Docker image
    const imageName = `ai-model-${Date.now()}`;
    await execAsync(`docker build -t ${imageName} ${modelDir}`);

    // 4. Configure GPU resources
    const gpuConfig = generateGPUConfig(resourceConfig);
    
    // 5. Start container with GPU configuration
    const containerName = `${imageName}-container`;
    await execAsync(`docker run -d --name ${containerName} --gpus '"device=0,capabilities=compute,utility"' ${gpuConfig} ${imageName}`);

    return NextResponse.json({
      success: true,
      containerId: containerName,
      endpoint: `http://localhost:${modelConfig.ports[0].split(':')[0]}`
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function generateDockerfile(config: any): string {
  return `FROM ${config.baseImage}

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
${config.ports.map(port => `EXPOSE ${port}`).join('\n')}

# Start the model server
CMD ["python3", "serve.py"]`;
}

function generateGPUConfig(config: any): string {
  const gpuMemory = parseInt(config.gpuMemory) / 100;
  return `--gpus "device=0,capabilities=compute,utility" \\
    --runtime=nvidia \\
    -e NVIDIA_VISIBLE_DEVICES=0 \\
    -e NVIDIA_DRIVER_CAPABILITIES=compute,utility \\
    --memory-reservation=${config.cpuLimit}g \\
    --memory=${config.cpuLimit * 2}g \\
    --cpus=${config.cpuLimit}`;
}
