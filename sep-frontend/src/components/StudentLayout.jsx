import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSignOutAlt, FaBookOpen, FaUserCircle, FaCalendarAlt, FaChartBar, FaSitemap } from 'react-icons/fa';

export default function StudentLayout({ children, activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Sinh Viên';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const menuItems = [
        { id: 'DASHBOARD', name: 'Tổng quan', icon: <FaUserCircle size={18} /> },
        { id: 'REGISTRATION', name: 'Đăng ký học phần', icon: <FaBookOpen size={18} /> },
        { id: 'TIMETABLE', name: 'Lịch học trong tuần', icon: <FaCalendarAlt size={18} /> },
        { id: 'GRADES', name: 'Kết quả học tập', icon: <FaChartBar size={18} /> },
        { id: 'CURRICULUM', name: 'Chương trình khung', icon: <FaSitemap size={18} /> },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f4f8', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
            {/* SIDEBAR MÀU XANH NGỌC ĐẬM (Chuẩn UTH) */}
            <div style={{ width: '260px', backgroundColor: '#006666', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)', zIndex: 20 }}>
                <div style={{ padding: '25px 20px', fontSize: '22px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaGraduationCap size={30} color="#ffc107" /> 
                    <span>SEP Portal</span>
                </div>
                <div style={{ flex: 1, padding: '15px 0' }}>
                    {menuItems.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab && setActiveTab(item.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', padding: '15px 25px', gap: '15px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.2s',
                                backgroundColor: activeTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                                borderLeft: activeTab === item.id ? '5px solid #ffc107' : '5px solid transparent',
                                color: activeTab === item.id ? '#ffc107' : '#e0e0e0'
                            }}
                        >
                            {item.icon} {item.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* HEADER TRẮNG */}
                <div style={{ height: '70px', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>{username}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Sinh viên CNTT</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#006666', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', marginLeft: '10px' }}>
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>

                {/* KHU VỰC RENDER TAB */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}