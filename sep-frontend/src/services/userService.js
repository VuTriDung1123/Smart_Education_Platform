import axiosClient from '../api/axiosClient';

const userService = {
    getAllUsers: async () => {
        const response = await axiosClient.get('/users');
        return response.data;
    },
    
    // 🔥 Sửa lại đường dẫn gọi API ở đây
    createUser: async (userData) => {
        const response = await axiosClient.post('/users/create-by-admin', userData);
        return response.data;
    },
    updateUser: async (id, userData) => {
        const response = await axiosClient.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axiosClient.delete(`/users/${id}`);
        return response.data;
    }
};

export default userService;