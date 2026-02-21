import { useEffect, useState } from 'react';
import subjectService from '../services/subjectService';
import AdminLayout from '../components/AdminLayout';
import { FaBook, FaTimes } from 'react-icons/fa';

export default function AdminSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        subjectCode: '',
        name: '',
        credits: 3,
        isElective: 'false',
        isCalculatedInGpa: 'true',
        description: ''
    });

    const fetchSubjects = async () => {
        try {
            const data = await subjectService.getAllSubjects();
            setSubjects(data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSubjects();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                credits: parseInt(formData.credits),
                isElective: formData.isElective === 'true',
                isCalculatedInGpa: formData.isCalculatedInGpa === 'true'
            };

            if (editId) {
                await subjectService.updateSubject(editId, payload);
                alert("✅ Cập nhật môn học thành công!");
            } else {
                await subjectService.createSubject(payload);
                alert("✅ Thêm môn học thành công!");
            }
            
            setIsModalOpen(false);
            setEditId(null);
            setFormData({ subjectCode: '', name: '', credits: 3, isElective: 'false', isCalculatedInGpa: 'true', description: '' });
            fetchSubjects();
        } catch (error) {
            alert("❌ Lỗi: " + error.message);
        }
    };

    const openEditModal = (subject) => {
        setEditId(subject.id);
        setFormData({
            subjectCode: subject.subjectCode,
            name: subject.name,
            credits: subject.credits,
            isElective: subject.isElective.toString(),
            isCalculatedInGpa: subject.isCalculatedInGpa.toString(),
            description: subject.description || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Xóa môn học này?")) {
            try {
                await subjectService.deleteSubject(id);
                fetchSubjects();
            } catch (error) {
                alert("❌ Lỗi xóa: " + error.message);
            }
        }
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#004085', margin: 0 }}>Quản lý Môn học</h2>
                <button 
                    onClick={() => { setEditId(null); setIsModalOpen(true); }}
                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Thêm Môn học
                </button>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                {loading ? <p>Đang tải...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '15px', color: '#495057' }}>Mã HP</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Tên môn học</th>
                                <th style={{ padding: '15px', color: '#495057', textAlign: 'center' }}>Tín chỉ</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Phân loại</th>
                                <th style={{ padding: '15px', color: '#495057', textAlign: 'center' }}>Tính GPA</th>
                                <th style={{ padding: '15px', color: '#495057', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((sub) => (
                                <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#0056b3' }}>{sub.subjectCode}</td>
                                    <td style={{ padding: '15px' }}>{sub.name}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>{sub.credits}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ backgroundColor: sub.isElective ? '#ffc107' : '#17a2b8', color: sub.isElective ? '#000' : '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {sub.isElective ? 'Tự chọn' : 'Bắt buộc'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <span style={{ color: sub.isCalculatedInGpa ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                            {sub.isCalculatedInGpa ? 'Có' : 'Không (*)'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button onClick={() => openEditModal(sub)} style={{ background: 'transparent', border: '1px solid #007bff', color: '#007bff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Sửa</button>
                                        <button onClick={() => handleDelete(sub.id)} style={{ background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* POPUP THÊM/SỬA */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#004085' }}><FaBook /> {editId ? 'Sửa Môn Học' : 'Thêm Môn Học Mới'}</h3>
                            <FaTimes style={{ cursor: 'pointer', color: '#dc3545', fontSize: '20px' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Mã học phần (*)</label>
                                <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tên môn học (*)</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Số tín chỉ (*)</label>
                                <input type="number" name="credits" min="1" max="15" value={formData.credits} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Loại môn</label>
                                    <select name="isElective" value={formData.isElective} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                        <option value="false">Bắt buộc</option>
                                        <option value="true">Tự chọn</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tính vào GPA?</label>
                                    <select name="isCalculatedInGpa" value={formData.isCalculatedInGpa} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                        <option value="true">Có tính</option>
                                        <option value="false">Không tính (*)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                                Lưu Môn Học
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}