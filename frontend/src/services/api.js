import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

export const apiService = {
  // System Health
  checkHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  checkHealthV1: async () => {
    const res = await client.get('/v1/health');
    return res.data;
  },

  // Module A: Deepfake Media Analysis (Image or Video)
  analyzeMedia: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/v1/deepfake/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data;
  },

  fetchDeepfakeSampleBlob: async (sampleType = 'real') => {
    const res = await client.get(`/v1/deepfake/sample?sample_type=${sampleType}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Legacy Single Image
  analyzeImage: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
    return res.data;
  },

  // Base64 Camera Frame Analysis
  analyzeFrame: async (base64Data) => {
    const res = await client.post('/analyze-frame', {
      frame_base64: base64Data,
    });
    return res.data;
  },

  // Module B: Biometric Face Matching
  matchIdentity: async (referenceFile, probeFile, consent = true, threshold = null) => {
    const formData = new FormData();
    formData.append('reference_file', referenceFile);
    formData.append('probe_file', probeFile);
    formData.append('consent', String(consent));
    if (threshold !== null) {
      formData.append('match_threshold', String(threshold));
    }

    const res = await client.post('/v1/identity/match', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  fetchSampleSelfieBlob: async (matchTarget = 'match') => {
    const res = await client.get(`/v1/identity/sample-selfie?match_target=${matchTarget}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Module C: Liveness PAD Sessions
  createLivenessSession: async () => {
    const res = await client.post('/v1/liveness/session');
    return res.data;
  },

  verifyLiveness: async (sessionId, nonce, frameBlobs) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('nonce', nonce);
    frameBlobs.forEach((b, idx) => {
      formData.append('frames', b, `frame_${idx}.jpg`);
    });

    const res = await client.post('/v1/liveness/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Module D: Document Forensics & ELA
  analyzeDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/v1/document/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getSyntheticSampleUrl: (sampleType = 'genuine', name = 'ALEXANDER CHEN') => {
    return `${API_BASE_URL}/v1/document/synthetic-sample?sample_type=${encodeURIComponent(sampleType)}&name=${encodeURIComponent(name)}`;
  },

  fetchSyntheticSampleBlob: async (sampleType = 'genuine', name = 'ALEXANDER CHEN') => {
    const res = await client.get(`/v1/document/synthetic-sample?sample_type=${sampleType}&name=${encodeURIComponent(name)}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Module E: Decision Engine & Reporting
  evaluateVerification: async (payload) => {
    const res = await client.post('/v1/verification/evaluate', payload);
    return res.data;
  },

  runFullKYC: async (docFile, selfieFile, consent = true, policy = 'BALANCED') => {
    const formData = new FormData();
    formData.append('document_file', docFile);
    formData.append('selfie_file', selfieFile);
    formData.append('consent', String(consent));
    formData.append('policy', policy);

    const res = await client.post('/v1/verification/full-kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getVerification: async (verificationId) => {
    const res = await client.get(`/v1/verification/${verificationId}`);
    return res.data;
  },

  getVerificationHistory: async (limit = 25, statusFilter = '') => {
    const params = { limit };
    if (statusFilter) params.status_filter = statusFilter;
    const res = await client.get('/v1/verification/history/list', { params });
    return res.data;
  },

  // Admin & Evaluation
  getAdminStats: async () => {
    const res = await client.get('/v1/admin/stats');
    return res.data;
  },

  getModelEvalMetrics: async () => {
    const res = await client.get('/v1/model-eval/metrics');
    return res.data;
  },

  getAuditLogs: async (limit = 50) => {
    const res = await client.get('/v1/admin/audit-logs', { params: { limit } });
    return res.data;
  },

  scrubPrivacyData: async () => {
    const res = await client.post('/v1/privacy/scrub');
    return res.data;
  },
};

export default apiService;
