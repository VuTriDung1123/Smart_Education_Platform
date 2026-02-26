import axiosClient from '../api/axiosClient';

const adminAcademicService = {
    // Khoa
    getDepartments: async () => (await axiosClient.get('/admin/academic/departments')).data,
    createDepartment: async (name) => (await axiosClient.post('/admin/academic/departments', { name })).data,
    deleteDepartment: async (id) => (await axiosClient.delete(`/admin/academic/departments/${id}`)).data,

    // Khóa luận
    getTheses: async () => (await axiosClient.get('/admin/academic/theses')).data,
    createThesis: async (title) => (await axiosClient.post('/admin/academic/theses', { title })).data,
    deleteThesis: async (id) => (await axiosClient.delete(`/admin/academic/theses/${id}`)).data,
};

export default adminAcademicService;