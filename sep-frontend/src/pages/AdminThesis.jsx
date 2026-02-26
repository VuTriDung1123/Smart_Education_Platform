import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import adminAcademicService from '../services/adminAcademicService';
import { FaGraduationCap, FaTrash } from 'react-icons/fa';

export default function AdminThesis() {
    const [theses, setTheses] = useState([]);
    const [title, setTitle] = useState('');

    const fetchData = async () => {
        try { setTheses(await adminAcademicService.getTheses()); } 
        catch (error) { console.error(error); }
    };

    useEffect(() => { 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminAcademicService.createThesis(title);
            setTitle('');
            fetchData();
            alert("✅ Đã mở đề tài đồ án mới!");
        } catch (error) { alert("❌ Lỗi: " + error.message); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Xóa đề tài này?")) {
            await adminAcademicService.deleteThesis(id);
            fetchData();
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#1a1d21', margin: 0 }}><FaGraduationCap /> Quản lý Đồ án & Khóa luận</h2>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
                <h4 style={{ marginTop: 0 }}>Mở Đề tài Khóa luận mới</h4>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '15px' }}>
                    <input type="text" placeholder="Nhập tên đề tài..." value={title} onChange={e => setTitle(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#1a1d21', color: '#e5a823', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Thêm Đề tài</button>
                </form>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1a1d21', color: 'white' }}>
                            <th style={{ padding: '15px' }}>Tên Đề tài (Topic)</th>
                            <th style={{ padding: '15px' }}>Giảng viên Hướng dẫn</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {theses.length === 0 ? <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>Chưa có đề tài nào.</td></tr> : theses.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#0056b3' }}>{t.title}</td>
                                <td style={{ padding: '15px', color: t.supervisorName === 'Chưa phân công' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>{t.supervisorName}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}><FaTrash size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}