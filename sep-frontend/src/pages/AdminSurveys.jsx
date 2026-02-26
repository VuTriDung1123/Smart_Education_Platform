import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import adminSystemService from '../services/adminSystemService';
import { FaClipboardList, FaTrash, FaPlay, FaStop } from 'react-icons/fa';

export default function AdminSurveys() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setSurveys(await adminSystemService.getSurveys());
            setLoading(false);
        } catch (error) {
            console.error("Lỗi:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchData();
    }, []);

    const handleToggle = async (id) => {
        try {
            await adminSystemService.toggleSurvey(id);
            fetchData();
        } catch (error) { alert("❌ Lỗi: " + error.message); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Xóa vĩnh viễn khảo sát này?")) {
            await adminSystemService.deleteSurvey(id);
            fetchData();
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#1a1d21', margin: 0 }}><FaClipboardList /> Quản lý Khảo sát (Surveys)</h2>
                <button style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Tạo Form Khảo sát mới
                </button>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {loading ? <p>Đang tải dữ liệu...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1a1d21', color: 'white' }}>
                                <th style={{ padding: '15px' }}>Tiêu đề Khảo sát</th>
                                <th style={{ padding: '15px' }}>Ngày tạo</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Trạng thái</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {surveys.length === 0 ? <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Chưa có khảo sát nào.</td></tr> : surveys.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>{s.title}</td>
                                    <td style={{ padding: '15px', color: '#666' }}>{new Date(s.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <span style={{ backgroundColor: s.isActive ? '#d4edda' : '#f8d7da', color: s.isActive ? '#155724' : '#721c24', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {s.isActive ? 'Đang mở' : 'Đã đóng'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button onClick={() => handleToggle(s.id)} style={{ background: s.isActive ? '#ffc107' : '#28a745', color: s.isActive ? '#000' : '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {s.isActive ? <><FaStop/> Đóng form</> : <><FaPlay/> Mở form</>}
                                        </button>
                                        <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}><FaTrash /></button>
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