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
    },

    // 🔥 CÁC HÀM COMBO SINH VIÊN 2 (QR & NỘP BÀI)
    getClassAssignments: async (classId) => {
        const response = await axiosClient.get(`/students/actions/classes/${classId}/assignments`);
        return response.data;
    },
    submitAssignment: async (assignmentId, fileUrl) => {
        const response = await axiosClient.post(`/students/actions/assignments/${assignmentId}/submit`, { fileUrl });
        return response.data;
    },
    submitAttendanceQR: async (qrData) => {
        const response = await axiosClient.post(`/students/actions/attendance/scan`, { qrData });
        return response.data;
    },

    // 🔥 CÁC HÀM COMBO 3: AI & ĐĂNG KÝ HỌC PHẦN
    getAvailableClasses: async () => {
        const response = await axiosClient.get(`/students/registration/available-classes`);
        return response.data;
    },
    getAiRecommendations: async () => {
        const response = await axiosClient.get(`/students/registration/ai-recommendations`);
        return response.data;
    },
    enrollNewClass: async (classId) => {
        const response = await axiosClient.post(`/students/registration/enroll/${classId}`);
        return response.data;
    },
    // 🔥 CÁC HÀM COMBO 4: INFO, TIMETABLE, CURRICULUM
    getTimetable: async () => {
        const response = await axiosClient.get(`/students/info/timetable`);
        return response.data;
    },
    getCurriculum: async () => {
        const response = await axiosClient.get(`/students/info/curriculum`);
        return response.data;
    },
    getProfile: async () => {
        const response = await axiosClient.get(`/students/info/profile`);
        return response.data;
    }
};

export default studentService;