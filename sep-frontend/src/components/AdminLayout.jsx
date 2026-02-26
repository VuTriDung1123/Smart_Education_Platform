import React from 'react';
import { FaUserShield, FaSignOutAlt, FaCalendarCheck, FaBookOpen, FaUsers, FaChartPie, FaChalkboard,FaGraduationCap, FaBuilding } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation(); // Tự động lấy đường dẫn hiện tại trên trình duyệt
    const username = localStorage.getItem('username') || 'Administrator';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login');
    };

    // 🔥 MAP CHUẨN VỚI CÁC ROUTE TRONG APP.JS CỦA BẠN
    const menuItems = [
        { path: '/admin', label: 'Dashboard & Thống kê', icon: <FaChartPie /> },
        { path: '/admin/users', label: 'Quản lý Người dùng', icon: <FaUsers /> },
        { path: '/admin/departments', label: 'Quản lý Khoa', icon: <FaBuilding /> }, // MỚI
        { path: '/admin/semesters', label: 'Quản lý Học kỳ', icon: <FaCalendarCheck /> },
        { path: '/admin/subjects', label: 'Quản lý Môn học', icon: <FaBookOpen /> },
        { path: '/admin/classrooms', label: 'Quản lý Lớp học', icon: <FaChalkboard /> },
        { path: '/admin/thesis', label: 'Quản lý Đồ án', icon: <FaGraduationCap /> }, // MỚI
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
            {/* Sidebar Đen Nhám */}
            <div style={{ width: '280px', backgroundColor: '#1a1d21', color: '#c2c7d0', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
                <div style={{ padding: '25px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '70px', height: '70px', backgroundColor: '#e5a823', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(229, 168, 35, 0.4)' }}>
                        <FaUserShield size={35} color="#1a1d21" />
                    </div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'white' }}>{username}</h3>
                    <span style={{ fontSize: '12px', color: '#e5a823', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Quản trị hệ thống</span>
                </div>
                
                <div style={{ padding: '20px 0', flex: 1 }}>
                    {menuItems.map(item => {
                        // So sánh chính xác URL để làm sáng Tab đang chọn
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <div 
                                key={item.path}
                                onClick={() => navigate(item.path)} // Điều hướng đến URL mới
                                style={{ 
                                    padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                    backgroundColor: isActive ? 'rgba(229, 168, 35, 0.1)' : 'transparent',
                                    borderLeft: isActive ? '4px solid #e5a823' : '4px solid transparent',
                                    color: isActive ? '#e5a823' : '#c2c7d0',
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                <span style={{ fontWeight: isActive ? '600' : 'normal' }}>{item.label}</span>
                            </div>
                        );
                    })}
                </div>

                <div onClick={handleLogout} style={{ padding: '20px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#dc3545', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.backgroundColor='rgba(220,53,69,0.1)'} onMouseLeave={e => e.target.style.backgroundColor='transparent'}>
                    <FaSignOutAlt size={18} /> <strong>Đăng xuất bảo mật</strong>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'white', padding: '20px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
                    <h2 style={{ margin: 0, color: '#1a1d21', fontWeight: 'bold' }}>Cổng Quản Trị Trung Tâm</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#28a745', borderRadius: '50%', display: 'inline-block' }}></span>
                        <span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>Hệ thống đang hoạt động</span>
                    </div>
                </div>
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}