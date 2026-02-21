import { useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaChalkboardTeacher, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const fullName = localStorage.getItem('fullName') || 'Admin';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // Danh sách menu
    const menuItems = [
        { path: '/admin', name: 'Tổng quan', icon: <FaTachometerAlt /> },
        { path: '/admin/subjects', name: 'Quản lý Môn học', icon: <FaChalkboardTeacher /> }, // Cập nhật dòng này
        { path: '#', name: 'Cài đặt hệ thống', icon: <FaCog /> },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'sans-serif' }}>
            {/* SIDEBAR (Cột Menu bên trái - Màu Xanh Dương Đậm) */}
            <div style={{ width: '260px', backgroundColor: '#004085', color: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <span style={{ color: '#66b2ff' }}>SEP</span> Admin
                </div>
                
                <div style={{ flex: 1, padding: '20px 0' }}>
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div 
                                key={index} 
                                onClick={() => item.path !== '#' && navigate(item.path)}
                                style={{ 
                                    padding: '15px 25px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '15px',
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? '#0056b3' : 'transparent',
                                    borderLeft: isActive ? '5px solid #66b2ff' : '5px solid transparent',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                <span style={{ fontSize: '16px' }}>{item.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* KHU VỰC BÊN PHẢI */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* HEADER (Thanh tiêu đề màu trắng) */}
                <div style={{ height: '70px', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>Xin chào, {fullName}</span>
                        <button 
                            onClick={handleLogout} 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            <FaSignOutAlt /> Đăng xuất
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT (Nội dung chính thay đổi theo trang) */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}