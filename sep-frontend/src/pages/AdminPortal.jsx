import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import adminService from '../services/adminService';
import { FaPlus, FaPowerOff, FaUnlockAlt, FaLock } from 'react-icons/fa';

export default function AdminPortal() {
    const [activeTab, setActiveTab] = useState('SEMESTERS');
    const [semesters, setSemesters] = useState([]);
    
    // Form tạo mới
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSemester, setNewSemester] = useState({ name: '', startDate: '', endDate: '' });

    // 🔥 1. ĐƯA HÀM fetchSemesters LÊN TRƯỚC
    const fetchSemesters = async () => {
        try {
            const data = await adminService.getSemesters();
            setSemesters(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách học kỳ:", error);
        }
    };

    // 🔥 2. ĐỂ useEffect XUỐNG DƯỚI
    useEffect(() => {
        if (activeTab === 'SEMESTERS') fetchSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleCreateSemester = async (e) => {
        e.preventDefault();
        try {
            await adminService.createSemester(newSemester);
            alert("✅ Tạo Học kỳ thành công!");
            setShowCreateForm(false);
            setNewSemester({ name: '', startDate: '', endDate: '' });
            fetchSemesters();
        } catch (error) {
            alert("❌ Lỗi: " + error.message);
        }
    };

    const handleToggleStatus = async (id, type) => {
        const actionName = type === 'active' ? 'kích hoạt học kỳ này' : 'thay đổi trạng thái đăng ký môn';
        if (!window.confirm(`Bạn có chắc muốn ${actionName}?`)) return;
        
        try {
            await adminService.toggleSemesterStatus(id, type);
            fetchSemesters();
        } catch (error) {
            alert("❌ Lỗi: " + error.message);
        }
    };

    const renderSemestersTab = () => (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '2px solid #f4f6f9', paddingBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#1a1d21', fontSize: '22px' }}>Cấu hình Học kỳ Hệ thống</h3>
                <button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{ backgroundColor: '#1a1d21', color: '#e5a823', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                >
                    <FaPlus /> Mở Học Kỳ Mới
                </button>
            </div>

            {/* Form Tạo mới */}
            {showCreateForm && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: '4px solid #e5a823' }}>
                    <form onSubmit={handleCreateSemester} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Tên Học kỳ (VD: HK1 2024-2025)</label>
                            <input type="text" required value={newSemester.name} onChange={e => setNewSemester({...newSemester, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Ngày bắt đầu</label>
                            <input type="date" required value={newSemester.startDate} onChange={e => setNewSemester({...newSemester, startDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Ngày kết thúc</label>
                            <input type="date" required value={newSemester.endDate} onChange={e => setNewSemester({...newSemester, endDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}>
                            Lưu cấu hình
                        </button>
                    </form>
                </div>
            )}

            {/* Bảng dữ liệu */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                    <tr style={{ backgroundColor: '#1a1d21', color: 'white' }}>
                        <th style={{ padding: '15px' }}>Tên Học Kỳ</th>
                        <th style={{ padding: '15px' }}>Thời gian</th>
                        <th style={{ padding: '15px' }}>Trạng thái Cổng Đăng Ký</th>
                        <th style={{ padding: '15px' }}>Trạng thái Giảng dạy</th>
                        <th style={{ padding: '15px' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {semesters.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '30px', color: '#888' }}>Chưa có học kỳ nào được cấu hình trên hệ thống.</td></tr>
                    ) : semesters.map(sem => (
                        <tr key={sem.id} style={{ borderBottom: '1px solid #eee', backgroundColor: sem.isActive ? '#fffdf5' : 'white' }}>
                            <td style={{ padding: '15px', fontWeight: 'bold', color: sem.isActive ? '#d39e00' : '#333' }}>{sem.name}</td>
                            <td style={{ padding: '15px', color: '#666', fontSize: '14px' }}>
                                {sem.startDate} &rarr; {sem.endDate}
                            </td>
                            <td style={{ padding: '15px' }}>
                                {sem.isRegistrationOpen ? 
                                    <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><FaUnlockAlt/> Đang mở</span> 
                                    : 
                                    <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><FaLock/> Đã đóng</span>
                                }
                            </td>
                            <td style={{ padding: '15px' }}>
                                {sem.isActive ? 
                                    <span style={{ color: '#e5a823', fontWeight: 'bold' }}>⭐ Đang diễn ra</span> 
                                    : 
                                    <span style={{ color: '#aaa' }}>Đã kết thúc / Chờ</span>
                                }
                            </td>
                            <td style={{ padding: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button 
                                    onClick={() => handleToggleStatus(sem.id, 'registration')}
                                    style={{ padding: '6px 12px', backgroundColor: sem.isRegistrationOpen ? '#ffc107' : '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                    {sem.isRegistrationOpen ? 'Khóa Đăng Ký' : 'Mở Đăng Ký'}
                                </button>
                                {!sem.isActive && (
                                    <button 
                                        onClick={() => handleToggleStatus(sem.id, 'active')}
                                        style={{ padding: '6px 12px', backgroundColor: '#1a1d21', color: '#e5a823', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaPowerOff/> Kích hoạt học kỳ
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <div style={{ animation: 'fadeIn 0.4s' }}>
                {activeTab === 'DASHBOARD' && <h2>Dashboard Overview (Coming Soon...)</h2>}
                {activeTab === 'SEMESTERS' && renderSemestersTab()}
                {activeTab === 'SUBJECTS' && <h2>Quản lý Môn học (Coming Soon...)</h2>}
                {activeTab === 'USERS' && <h2>Quản lý Người dùng (Coming Soon...)</h2>}
            </div>
        </AdminLayout>
    );
}