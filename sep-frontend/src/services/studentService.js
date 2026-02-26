import axiosClient from '../api/axiosClient';

const studentService = {
    // --- CÁC HÀM CŨ CỦA BẠN ---
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
    },

    // --- CÁC HÀM MỚI CHO DASHBOARD & LỚP HỌC ---
    getMyClasses: async () => {
        const response = await axiosClient.get(`/students/my-classes`);
        return response.data;
    },
    getMyGrades: async (classId) => {
        const response = await axiosClient.get(`/students/classes/${classId}/grades`);
        return response.data;
    },
    getAnnouncements: async (classId) => {
        const response = await axiosClient.get(`/students/classes/${classId}/announcements`);
        return response.data;
    },
    getDashboard: async () => {
        const response = await axiosClient.get(`/students/dashboard`);
        return response.data;
    }
};

export default studentService;