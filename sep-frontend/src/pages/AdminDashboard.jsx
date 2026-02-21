import { useEffect, useState } from 'react';
import userService from '../services/userService';
import AdminLayout from '../components/AdminLayout';
import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaTimes } from 'react-icons/fa';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ==========================================
    // 1. STATE CHO POPUP THÊM MỚI
    // ==========================================
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'STUDENT' // Mặc định là Sinh viên
    });

    // ==========================================
    // 2. STATE CHO POPUP SỬA (UPDATE)
    // ==========================================
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        fullName: '',
        email: '',
        status: 'ACTIVE',
        role: 'STUDENT'
    });

    // ==========================================
    // 3. CÁC HÀM GỌI API
    // ==========================================
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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers();
    }, []);

    // Xử lý khi gõ vào form THÊM
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Hàm THÊM TÀI KHOẢN
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const newUser = {
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role
            };
            
            await userService.createUser(newUser);
            alert("✅ Tạo tài khoản thành công!");
            
            setIsModalOpen(false); 
            setFormData({ username: '', password: '', fullName: '', email: '', role: 'STUDENT' }); 
            fetchUsers(); 
            
        } catch (error) {
            alert("❌ Lỗi khi tạo tài khoản: " + error.message);
        }
    };

    // Hàm mở Popup SỬA và điền sẵn thông tin cũ
    const openEditModal = (user) => {
        setEditUserId(user.id);
        setEditFormData({
            fullName: user.fullName,
            email: user.email,
            status: user.status,
            role: user.roles[0]?.name || 'STUDENT'
        });
        setIsEditModalOpen(true);
    };

    // Hàm SỬA TÀI KHOẢN
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await userService.updateUser(editUserId, editFormData);
            alert("✅ Cập nhật thành công!");
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            alert("❌ Lỗi cập nhật: " + error.message);
        }
    };

    // Hàm XÓA TÀI KHOẢN
    const handleDeleteUser = async (id) => {
        if (window.confirm("⚠️ Bạn có chắc chắn muốn xóa tài khoản này vĩnh viễn không?")) {
            try {
                await userService.deleteUser(id);
                alert("✅ Đã xóa tài khoản!");
                fetchUsers();
            } catch (error) {
                alert("❌ Lỗi xóa tài khoản: " + error.message);
            }
        }
    };

    // Thống kê số lượng
    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.roles.some(r => r.name === 'STUDENT')).length;
    const totalLecturers = users.filter(u => u.roles.some(r => r.name === 'LECTURER')).length;
    
    return (
        <AdminLayout>
            <h2 style={{ color: '#004085', marginBottom: '25px', marginTop: 0 }}>Tổng quan hệ thống</h2>

            {/* 3 THẺ THỐNG KÊ */}
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

            {/* BẢNG TÀI KHOẢN */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Danh sách người dùng</h3>
                    
                    {/* NÚT BẬT POPUP THÊM */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
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
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
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
                                    
                                    {/* NÚT SỬA & XÓA */}
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => openEditModal(user)} 
                                            style={{ background: 'transparent', border: '1px solid #007bff', color: '#007bff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                                            Sửa
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(user.id)} 
                                            style={{ background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ==========================================
                POPUP (MODAL) TẠO TÀI KHOẢN MỚI 
            ========================================== */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#004085' }}>Tạo Tài Khoản Mới</h3>
                            <FaTimes style={{ cursor: 'pointer', color: '#dc3545', fontSize: '20px' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        
                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tên đăng nhập (*)</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Mật khẩu (*)</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Họ và Tên (*)</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Vai trò (Quyền)</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                    <option value="STUDENT">Sinh viên</option>
                                    <option value="LECTURER">Giảng viên</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                </select>
                            </div>
                            
                            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                                Lưu Tài Khoản
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ==========================================
                POPUP (MODAL) SỬA TÀI KHOẢN 
            ========================================== */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#ff9900' }}>Sửa Tài Khoản</h3>
                            <FaTimes style={{ cursor: 'pointer', color: '#dc3545', fontSize: '20px' }} onClick={() => setIsEditModalOpen(false)} />
                        </div>
                        
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Họ và Tên (*)</label>
                                <input type="text" value={editFormData.fullName} onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Email</label>
                                <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Vai trò (Quyền)</label>
                                <select value={editFormData.role} onChange={(e) => setEditFormData({...editFormData, role: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                    <option value="STUDENT">Sinh viên</option>
                                    <option value="LECTURER">Giảng viên</option>
                                    <option value="ADMIN">Quản trị viên</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Trạng thái</label>
                                <select value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                    <option value="ACTIVE">Đang hoạt động</option>
                                    <option value="INACTIVE">Khóa tài khoản</option>
                                </select>
                            </div>
                            
                            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#ff9900', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                                Cập Nhật
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}