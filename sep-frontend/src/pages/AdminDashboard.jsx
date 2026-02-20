import { useEffect, useState } from 'react';
import userService from '../services/userService';

export default function AdminDashboard() {
    const fullName = localStorage.getItem('fullName');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tự động chạy khi mở trang
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAllUsers();
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách user:", error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#d9363e' }}>👑 Quản trị Hệ thống</h1>
                <div>
                    <span style={{ marginRight: '15px', fontWeight: 'bold' }}>Xin chào, {fullName}</span>
                    <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Đăng xuất
                    </button>
                </div>
            </div>
            
            <hr style={{ margin: '20px 0' }} />
            
            <h2>Danh sách tài khoản hệ thống</h2>
            
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>STT</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên đăng nhập</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Họ và tên</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Email</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Quyền</th>
                            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{index + 1}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>{user.username}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.fullName}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
                                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                    {user.roles.map(r => r.name).join(', ')}
                                </td>
                                <td style={{ padding: '12px', border: '1px solid #ddd', color: user.status === 'ACTIVE' ? 'green' : 'red' }}>
                                    {user.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}