import axiosClient from '../api/axiosClient';

const adminService = {
    getSemesters: async () => {
        const response = await axiosClient.get('/admin/semesters');
        return response.data;
    },
    createSemester: async (semesterData) => {
        const response = await axiosClient.post('/admin/semesters', semesterData);
        return response.data;
    },
    toggleSemesterStatus: async (id, type) => {
        const response = await axiosClient.put(`/admin/semesters/${id}/toggle?type=${type}`);
        return response.data;
    }
};

export default adminService;