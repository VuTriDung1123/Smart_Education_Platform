import axiosClient from '../api/axiosClient';

const lecturerService = {
    getMyClasses: async (lecturerId) => { 
        // Thêm lecturerId vào url
        const response = await axiosClient.get(`/lecturer/${lecturerId}/my-classes`);
        return response.data;
    },
    getStudentsInClass: async (classId) => {
        const response = await axiosClient.get(`/lecturer/classes/${classId}/students`);
        return response.data;
    },
    saveGrades: async (classId, studentId, gradeData) => {
        const response = await axiosClient.post(`/lecturer/classes/${classId}/students/${studentId}/grades`, gradeData);
        return response.data;
    },

    // 🔥 CÁC HÀM MỚI COMBO 1
    getAnnouncements: async (classId) => {
        const response = await axiosClient.get(`/lecturer/actions/classes/${classId}/announcements`);
        return response.data;
    },
    createAnnouncement: async (classId, lecturerId, data) => {
        const response = await axiosClient.post(`/lecturer/actions/classes/${classId}/announcements?lecturerId=${lecturerId}`, data);
        return response.data;
    },
    lockGrades: async (classId) => {
        const response = await axiosClient.put(`/lecturer/actions/classes/${classId}/lock`);
        return response.data;
    },
    importGradesExcel: async (classId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosClient.post(`/lecturer/actions/classes/${classId}/import-grades`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // 🔥 CÁC HÀM MỚI COMBO 2 (BÀI TẬP & ĐỒ ÁN)
    getAssignments: async (classId) => {
        const response = await axiosClient.get(`/lecturer/classes/${classId}/assignments`);
        return response.data;
    },
    createAssignment: async (classId, data) => {
        const response = await axiosClient.post(`/lecturer/classes/${classId}/assignments`, data);
        return response.data;
    },
    getMyTheses: async (lecturerId) => {
        const response = await axiosClient.get(`/lecturer/${lecturerId}/theses`);
        return response.data;
    },
    gradeThesis: async (thesisId, data) => {
        const response = await axiosClient.put(`/lecturer/theses/${thesisId}/grade`, data);
        return response.data;
    }
};

export default lecturerService;