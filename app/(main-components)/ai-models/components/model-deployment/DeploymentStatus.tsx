import React from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface DeploymentStep {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  message?: string;
}

interface DeploymentStatusProps {
  steps: DeploymentStep[];
  currentStep: string;
}

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ steps, currentStep }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4">Deployment Progress</h3>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start">
              <div className="mt-1">
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                )}
                {step.status === 'in-progress' && (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                )}
                {step.status === 'completed' && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
                {step.status === 'failed' && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    step.status === 'in-progress' ? 'text-blue-400' :
                    step.status === 'completed' ? 'text-green-400' :
                    step.status === 'failed' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                  {step.status === 'in-progress' && (
                    <span className="text-sm text-blue-400">In Progress...</span>
                  )}
                </div>
                {step.message && (
                  <p className="text-sm text-gray-500 mt-1">{step.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Logs */}
      <div className="bg-[#222] p-4 rounded-lg">
        <h3 className="text-white font-medium mb-4">Deployment Logs</h3>
        <div className="bg-black/30 p-3 rounded h-48 overflow-y-auto font-mono text-sm">
          <pre className="text-gray-400">
            {`[INFO] Starting deployment process...
[INFO] Building Docker image...
[INFO] Pushing image to registry...
[INFO] Configuring GPU resources...
[INFO] Setting up network volumes...
[INFO] Starting container...`}
          </pre>
        </div>
      </div>
    </div>
  );
};
