import axiosClient from '../api/axiosClient';

const studentService = {
    getAllClassrooms: async () => {
        const response = await axiosClient.get('/classrooms');
        return response.data;
    },
    enrollClass: async (classId, studentId) => {
        const response = await axiosClient.post(`/classrooms/${classId}/students/${studentId}`);
        return response.data;
    },
    dropClass: async (classId, studentId) => {
        const response = await axiosClient.delete(`/classrooms/${classId}/students/${studentId}`);
        return response.data;
    },
    getMyPortalData: async (userId) => {
        const response = await axiosClient.get(`/student-portal/me/${userId}`);
        return response.data;
    },
    updateProfile: async (userId, profileData) => {
        const response = await axiosClient.put(`/student-portal/profile/${userId}`, profileData);
        return response.data;
    }
};

export default studentService;