import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export function GPULabConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      // Use the dedicated test endpoint
      const response = await fetch('/api/gpulab/test-connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus('connected');
        setErrorMessage('');
      } else {
        setConnectionStatus('failed');
        setErrorMessage(data.details || data.error || 'Failed to connect to GPULab');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionStatus('failed');
      setErrorMessage('Unable to connect to GPULab. Please check your API key and network connection.');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-[#1a1a1a] rounded-xl p-6 shadow-xl border border-gray-800 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`rounded-full p-2 ${
            connectionStatus === 'checking' ? 'bg-yellow-500/20' :
            connectionStatus === 'connected' ? 'bg-green-500/20' :
            'bg-red-500/20'
          }`}>
            {connectionStatus === 'checking' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400" />
            ) : connectionStatus === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">GPULab Connection</h3>
            <p className={`text-sm ${
              connectionStatus === 'checking' ? 'text-yellow-400' :
              connectionStatus === 'connected' ? 'text-green-400' :
              'text-red-400'
            }`}>
              {connectionStatus === 'checking' ? 'Checking connection...' :
               connectionStatus === 'connected' ? 'Connected to GPULab' :
               'Connection failed'}
            </p>
          </div>
        </div>
        
        <button
          onClick={checkConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Connection
        </button>
      </div>

      {connectionStatus === 'failed' && errorMessage && (
        <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-medium mb-1">Connection Error</h4>
              <p className="text-red-300 text-sm">{errorMessage}</p>
              <div className="mt-3 space-y-2 text-sm text-red-300">
                <p>Please check:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Your GPULab API key is correctly set in .env.local</li>
                  <li>Your GPULab account is active</li>
                  <li>You have a stable internet connection</li>
                  <li>GPULab services are operational</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
