import axiosClient from '../api/axiosClient';

const userService = {
    // Gọi API GET /api/users bên Spring Boot
    getAllUsers: async () => {
        const response = await axiosClient.get('/users');
        return response.data;
    }
};

export default userService;