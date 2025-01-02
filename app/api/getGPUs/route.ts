import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GPU_LAB_API_KEY;
  const endpoint = "https://api.gpulab.ai/gpus";

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing' });
  }

  try {
    const response = await axios.get(endpoint, {
      headers: { 'api-key': apiKey },
    });

    // Filter GPUs to include only those that are available
    const availableGPUs = response.data.filter((gpu: any) => gpu.available);

    res.status(200).json(availableGPUs);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.message || 'Failed to fetch GPUs',
    });
  }
}