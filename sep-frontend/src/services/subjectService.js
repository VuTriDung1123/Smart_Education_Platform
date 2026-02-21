import axiosClient from '../api/axiosClient';

const subjectService = {
    getAllSubjects: async () => {
        const response = await axiosClient.get('/subjects');
        return response.data;
    },
    createSubject: async (data) => {
        const response = await axiosClient.post('/subjects', data);
        return response.data;
    },
    updateSubject: async (id, data) => {
        const response = await axiosClient.put(`/subjects/${id}`, data);
        return response.data;
    },
    deleteSubject: async (id) => {
        const response = await axiosClient.delete(`/subjects/${id}`);
        return response.data;
    }
};

export default subjectService;