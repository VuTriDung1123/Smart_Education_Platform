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
    }
};

export default userService;