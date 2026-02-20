import axiosClient from '../api/axiosClient';

const authService = {
    login: async (username, password) => {
        const response = await axiosClient.post('/auth/login', {
            username: username,
            password: password
        });
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('fullName', response.data.fullName);
            // Lấy quyền đầu tiên trong mảng để phân luồng (Ví dụ: "STUDENT")
            localStorage.setItem('role', response.data.roles[0]); 
        }
        return response.data;
    },

    logout: () => {
        localStorage.clear(); // Xóa sạch bộ nhớ khi đăng xuất
    }
};

export default authService;