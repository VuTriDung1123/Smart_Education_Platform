import axios from 'axios';

// 1. Tạo cấu hình chung (Base URL backend của bạn)
const axiosClient = axios.create({
    baseURL: 'http://localhost:8081/api', // Cổng 8081 của Spring Boot
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Cái này gọi là Interceptor (Lính gác cổng)
// Mỗi lần gửi request đi, nó sẽ tự lục túi xem có Token không để kẹp vào
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Lấy token từ bộ nhớ trình duyệt
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;