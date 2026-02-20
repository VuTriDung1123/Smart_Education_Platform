import { useEffect, useState } from 'react';
import userService from '../services/userService';
import AdminLayout from '../components/AdminLayout';
import { FaUserGraduate, FaChalkboardTeacher, FaUsers } from 'react-icons/fa';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAllUsers();
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi:", error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Đếm số lượng để hiển thị lên thẻ Thống kê
    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.roles.some(r => r.name === 'STUDENT')).length;
    const totalLecturers = users.filter(u => u.roles.some(r => r.name === 'LECTURER')).length;

    return (
        <AdminLayout>
            <h2 style={{ color: '#004085', marginBottom: '25px', marginTop: 0 }}>Tổng quan hệ thống</h2>

            {/* 3 THẺ THỐNG KÊ (CARDS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
                <div style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,123,255,0.3)' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Tổng Tài Khoản</p>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '36px' }}>{totalUsers}</h2>
                    </div>
                    <FaUsers size={50} style={{ opacity: 0.5 }} />
                </div>

                <div style={{ background: 'linear-gradient(135deg, #28a745, #1e7e34)', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(40,167,69,0.3)' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Sinh Viên</p>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '36px' }}>{totalStudents}</h2>
                    </div>
                    <FaUserGraduate size={50} style={{ opacity: 0.5 }} />
                </div>

                <div style={{ background: 'linear-gradient(135deg, #fd7e14, #e8590c)', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(253,126,20,0.3)' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Giảng Viên</p>
                        <h2 style={{ margin: '10px 0 0 0', fontSize: '36px' }}>{totalLecturers}</h2>
                    </div>
                    <FaChalkboardTeacher size={50} style={{ opacity: 0.5 }} />
                </div>
            </div>

            {/* BẢNG TÀI KHOẢN MỚI */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Danh sách người dùng</h3>
                    <button style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        + Thêm tài khoản mới
                    </button>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>Đang tải dữ liệu...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '15px', color: '#495057' }}>STT</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Tên đăng nhập</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Họ và tên</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Quyền</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Trạng thái</th>
                                <th style={{ padding: '15px', color: '#495057', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '15px', color: '#666' }}>{index + 1}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#0056b3' }}>{user.username}</td>
                                    <td style={{ padding: '15px', color: '#333' }}>{user.fullName}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ backgroundColor: '#e2e3e5', color: '#383d41', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {user.roles.map(r => r.name).join(', ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ color: user.status === 'ACTIVE' ? '#28a745' : '#dc3545', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.status === 'ACTIVE' ? '#28a745' : '#dc3545' }}></div>
                                            {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button style={{ background: 'transparent', border: '1px solid #007bff', color: '#007bff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Sửa</button>
                                        <button style={{ background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
}