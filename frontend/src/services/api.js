import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const apiService = {
  // Health & Model Status
  checkHealth: async () => {
    const response = await client.get('/health');
    return response.data;
  },

  // Single Image Authenticity Analysis
  analyzeImage: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  // Base64 Camera Frame Analysis
  analyzeFrame: async (base64Data) => {
    const response = await client.post('/analyze-frame', {
      frame_base64: base64Data,
    });
    return response.data;
  },
};

export default apiService;
