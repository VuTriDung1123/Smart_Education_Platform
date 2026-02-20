import axiosClient from '../api/axiosClient';

const authService = {
    login: async (username, password) => {
        // Không cần try-catch ở đây nữa
        const response = await axiosClient.post('/auth/login', {
            username: username,
            password: password
        });
        
        // Nếu API trả về thành công (200 OK) thì chạy đoạn này
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', username);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    }
};

export default authService;