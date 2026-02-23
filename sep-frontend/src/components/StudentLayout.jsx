import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSignOutAlt, FaBookOpen } from 'react-icons/fa';

export default function StudentLayout({ children }) {
    const navigate = useNavigate();
    const username = localStorage.getItem('username') || 'Sinh Viên';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'Arial, sans-serif' }}>
            {/* Sidebar Màu Xanh Lá */}
            <div style={{ width: '260px', backgroundColor: '#198754', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <FaGraduationCap size={30} /> SEP Student
                </div>
                <div style={{ flex: 1, padding: '20px 0' }}>
                    <Link to="/student" style={{ display: 'flex', alignItems: 'center', padding: '15px 25px', color: 'white', textDecoration: 'none', transition: '0.3s', backgroundColor: 'rgba(255,255,255,0.1)', borderLeft: '5px solid #ffc107', gap: '15px', fontWeight: 'bold' }}>
                        <FaBookOpen size={20} /> Cổng Đăng Ký Học Phần
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ height: '70px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', zIndex: 10 }}>
                    <h3 style={{ margin: 0, color: '#198754' }}>Cổng Thông Tin Sinh Viên</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Xin chào, {username}</span>
                        <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                            <FaSignOutAlt /> Đăng xuất
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}