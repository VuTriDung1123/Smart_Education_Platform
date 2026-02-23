import axiosClient from '../api/axiosClient';

const lecturerService = {
    getMyClasses: async (lecturerId) => {
        const response = await axiosClient.get(`/lecturer/${lecturerId}/classes`);
        return response.data;
    },
    getStudentsInClass: async (classId) => {
        const response = await axiosClient.get(`/lecturer/classes/${classId}/students`);
        return response.data;
    },
    saveGrades: async (classId, studentId, gradeData) => {
        const response = await axiosClient.post(`/lecturer/classes/${classId}/students/${studentId}/grades`, gradeData);
        return response.data;
    }
};

export default lecturerService;