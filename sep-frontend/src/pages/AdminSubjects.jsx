import React, { useEffect, useState } from 'react';
import subjectService from '../services/subjectService';
import AdminLayout from '../components/AdminLayout';
import { FaBook, FaTimes, FaSearch } from 'react-icons/fa';

export default function AdminSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // States cho Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        subjectCode: '', name: '', credits: 3, isElective: 'false', isCalculatedInGpa: 'true', category: 'Chuyên ngành', description: ''
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
            } else {
                await subjectService.createSubject(payload);
            }
            setIsModalOpen(false);
            fetchSubjects();
        } catch (error) {
            alert("❌ Lỗi: " + error.message);
        }
    };

    const openEditModal = (subject) => {
        setEditId(subject.id);
        setFormData({
            subjectCode: subject.subjectCode, name: subject.name, credits: subject.credits, 
            isElective: subject.isElective.toString(), isCalculatedInGpa: subject.isCalculatedInGpa.toString(),
            category: subject.category || 'Chuyên ngành', description: subject.description || ''
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

    // Lọc môn học theo từ khóa tìm kiếm
    const filteredSubjects = subjects.filter(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🔥 GOM NHÓM MÔN HỌC THEO CATEGORY
    const groupedSubjects = filteredSubjects.reduce((groups, subject) => {
        const groupName = subject.category || 'Chưa phân loại';
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(subject);
        return groups;
    }, {});

    // Component nhỏ để vẽ Badge Môn Ràng buộc có Tooltip
    const ConditionBadge = ({ label, subjects }) => {
        if (!subjects || subjects.length === 0) return null;
        return (
            <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', width: '55px' }}>{label}:</span>
                {subjects.map(p => (
                    <span 
                        key={p.id} 
                        title={p.name} // 🔥 Trỏ chuột vào sẽ hiện tên môn học
                        style={{ backgroundColor: '#f8f9fa', border: '1px solid #ced4da', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', cursor: 'help', fontWeight: 'bold', color: '#495057' }}
                    >
                        {p.subjectCode}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#004085', margin: 0 }}>Quản lý Chương trình đào tạo</h2>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', top: '10px', left: '15px', color: '#999' }} />
                        <input 
                            type="text" 
                            placeholder="Tìm mã hoặc tên môn..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 15px 8px 40px', borderRadius: '20px', border: '1px solid #ccc', width: '250px', outline: 'none' }}
                        />
                    </div>
                    <button 
                        onClick={() => { setEditId(null); setIsModalOpen(true); }}
                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                        + Thêm Môn học
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? <p style={{ padding: '20px' }}>Đang tải dữ liệu...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#004085', color: 'white' }}>
                                <th style={{ padding: '15px' }}>Mã HP</th>
                                <th style={{ padding: '15px' }}>Tên môn học</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>TC</th>
                                <th style={{ padding: '15px' }}>Điều kiện (Ràng buộc)</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Loại môn</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedSubjects).length > 0 ? (
                                Object.keys(groupedSubjects).map(category => (
                                    <React.Fragment key={category}>
                                        {/* 🔥 HÀNG TIÊU ĐỀ GOM NHÓM */}
                                        <tr style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #dee2e6' }}>
                                            <td colSpan="6" style={{ padding: '10px 15px', fontWeight: 'bold', color: '#495057', fontSize: '15px' }}>
                                                📁 Nhóm: <span style={{ color: '#0056b3' }}>{category}</span> 
                                                <span style={{ fontWeight: 'normal', fontSize: '13px', marginLeft: '10px', color: '#666' }}>({groupedSubjects[category].length} môn)</span>
                                            </td>
                                        </tr>

                                        {/* DANH SÁCH MÔN TRONG NHÓM */}
                                        {groupedSubjects[category].map((sub) => (
                                            <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#0056b3' }}>{sub.subjectCode}</td>
                                                <td style={{ padding: '15px', fontWeight: '500' }}>
                                                    {sub.name}
                                                    {/* Hiển thị Nhóm tự chọn tín chỉ nếu có */}
                                                    {sub.electiveGroupName && (
                                                        <div style={{ fontSize: '12px', color: '#d9363e', marginTop: '4px', fontStyle: 'italic' }}>
                                                            {sub.electiveGroupName}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>{sub.credits}</td>
                                                
                                                {/* 🔥 CỘT RÀNG BUỘC CÓ TOOLTIP */}
                                                <td style={{ padding: '10px 15px' }}>
                                                    <ConditionBadge label="Học trước" subjects={sub.previousSubjects} />
                                                    <ConditionBadge label="Tiên quyết" subjects={sub.prerequisiteSubjects} />
                                                    <ConditionBadge label="Song hành" subjects={sub.corequisiteSubjects} />
                                                    {(!sub.previousSubjects?.length && !sub.prerequisiteSubjects?.length && !sub.corequisiteSubjects?.length) && 
                                                        <span style={{ color: '#aaa', fontSize: '13px', fontStyle: 'italic' }}>Không có</span>
                                                    }
                                                </td>

                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <span style={{ 
                                                        backgroundColor: sub.isElective ? '#ffc107' : '#17a2b8', 
                                                        color: sub.isElective ? '#000' : '#fff', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '4px', 
                                                        fontSize: '12px', 
                                                        fontWeight: 'bold',
                                                        whiteSpace: 'nowrap' 
                                                    }}>
                                                        {sub.isElective ? 'Tự chọn' : 'Bắt buộc'}
                                                    </span>
                                                </td>
                                                
                                                {/* 🔥 CỘT THAO TÁC (SỬA VÀ XÓA ĐÃ ĐƯỢC ĐẶT ĐÚNG CHỖ) */}
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => openEditModal(sub)} 
                                                        style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}>
                                                        Sửa
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(sub.id)} 
                                                        style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold' }}>
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Không tìm thấy môn học nào...</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Popup Thêm / Sửa (Giữ nguyên như cũ) */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#004085' }}><FaBook /> {editId ? 'Sửa Môn Học' : 'Thêm Môn Học Mới'}</h3>
                            <FaTimes style={{ cursor: 'pointer', color: '#dc3545', fontSize: '20px' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Mã học phần (*)</label>
                                    <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Nhóm môn</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                        <option value="Cơ bản">Cơ bản</option>
                                        <option value="Chính trị">Chính trị</option>
                                        <option value="Chuyên ngành">Chuyên ngành</option>
                                        <option value="Thể chất & QP-AN">Thể chất & QP-AN</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tên môn học (*)</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tín chỉ (*)</label>
                                    <input type="number" name="credits" min="1" max="15" value={formData.credits} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Loại môn</label>
                                    <select name="isElective" value={formData.isElective} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                        <option value="false">Bắt buộc</option>
                                        <option value="true">Tự chọn</option>
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