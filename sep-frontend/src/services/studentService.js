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
    }
};

export default studentService;