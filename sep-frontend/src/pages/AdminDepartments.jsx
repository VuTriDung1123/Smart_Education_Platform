import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import adminAcademicService from '../services/adminAcademicService';
import { FaBuilding, FaTrash } from 'react-icons/fa';

export default function AdminDepartments() {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');

    const fetchData = async () => {
        try { setDepartments(await adminAcademicService.getDepartments()); } 
        catch (error) { console.error(error); }
    };

    
    useEffect(() => { 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await adminAcademicService.createDepartment(name);
            setName('');
            fetchData();
            alert("✅ Thêm Khoa thành công!");
        } catch (error) { alert("❌ Lỗi: " + (error.response?.data || error.message)); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Xóa Khoa này?")) {
            await adminAcademicService.deleteDepartment(id);
            fetchData();
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#1a1d21', margin: 0 }}><FaBuilding /> Quản lý Khoa (Departments)</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                {/* Form Thêm */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h4 style={{ marginTop: 0 }}>Thêm Khoa Mới</h4>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="text" placeholder="Tên Khoa (VD: Khoa CNTT)..." value={name} onChange={e => setName(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
                        <button type="submit" style={{ padding: '12px', backgroundColor: '#e5a823', color: '#1a1d21', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Lưu Khoa</button>
                    </form>
                </div>

                {/* Bảng dữ liệu */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1a1d21', color: 'white' }}>
                                <th style={{ padding: '15px' }}>STT</th>
                                <th style={{ padding: '15px' }}>Tên Khoa</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((d, index) => (
                                <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>{index + 1}</td>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#0056b3' }}>{d.name}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}><FaTrash size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}