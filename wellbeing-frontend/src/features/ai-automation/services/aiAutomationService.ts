import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const aiApiClient = axios.create({
    baseURL: `${API_URL}/ai`,
    headers: {
        'Content-Type': 'application/json',
    },
});

aiApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const aiAutomationService = {
    detectConflicts: async () => {
        const response = await aiApiClient.get('/detect-conflicts');
        return response.data;
    },
    
    assignTask: async (payload: any) => {
        const response = await aiApiClient.post('/assign-task', payload);
        return response.data;
    },
    
    breakdownTask: async (payload: any) => {
        const response = await aiApiClient.post('/break-down-task', payload);
        return response.data;
    },
    
    simulateImpact: async (payload: { riskMode: string }) => {
        const response = await aiApiClient.post('/simulate-impact', payload);
        return response.data;
    },
    
    getDecisionTrace: async (id: string) => {
        const response = await aiApiClient.get(`/decision-trace/${id}`);
        return response.data;
    }
};
