import axiosClient from '../api/axiosClient';

const adminSystemService = {
    // Khảo sát
    getSurveys: async () => (await axiosClient.get('/admin/system/surveys')).data,
    toggleSurvey: async (id) => (await axiosClient.put(`/admin/system/surveys/${id}/toggle`)).data,
    deleteSurvey: async (id) => (await axiosClient.delete(`/admin/system/surveys/${id}`)).data,

    // AI Logs
    getAiLogs: async () => (await axiosClient.get('/admin/system/ai-logs')).data,
};

export default adminSystemService;