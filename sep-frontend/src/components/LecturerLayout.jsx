import React from 'react';
import { FaChalkboardTeacher, FaUsers, FaSignOutAlt, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function LecturerLayout({ children, activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Giảng viên';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const menuItems = [
        { id: 'DASHBOARD', label: 'Tổng quan', icon: <FaChalkboardTeacher /> },
        { id: 'MY_CLASSES', label: 'Lớp học & Chấm điểm', icon: <FaUsers /> },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* Sidebar Xanh Đen */}
            <div style={{ width: '260px', backgroundColor: '#1A237E', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
                <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaUserTie size={40} color="white" />
                    </div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{username}</h3>
                    <span style={{ fontSize: '13px', backgroundColor: '#FF6D00', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>Giảng viên</span>
                </div>
                
                <div style={{ padding: '20px 0', flex: 1 }}>
                    {menuItems.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{ 
                                padding: '15px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                                backgroundColor: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderLeft: activeTab === item.id ? '4px solid #FF6D00' : '4px solid transparent',
                                transition: 'all 0.3s'
                            }}
                        >
                            <span style={{ fontSize: '18px', color: activeTab === item.id ? '#FF6D00' : 'white' }}>{item.icon}</span>
                            <span style={{ fontWeight: activeTab === item.id ? 'bold' : 'normal' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div onClick={handleLogout} style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#ff8a80' }}>
                    <FaSignOutAlt /> <strong>Đăng xuất</strong>
                </div>
            </div>

            {/* Nội dung chính */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'white', padding: '15px 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
                    <h2 style={{ margin: 0, color: '#1A237E' }}>Cổng Thông Tin Giảng Viên</h2>
                    <span style={{ color: '#666' }}>Học kỳ 1 - Năm học 2024-2025</span>
                </div>
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}