import React, { useEffect, useState } from 'react';
import classroomService from '../services/classroomService';
import subjectService from '../services/subjectService';
import userService from '../services/userService';
import AdminLayout from '../components/AdminLayout';
import { FaChalkboard, FaTimes, FaSearch, FaUserTie } from 'react-icons/fa';

export default function AdminClassrooms() {
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // States cho Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        classCode: '',
        subjectId: '',
        lecturerId: ''
    });

    const fetchData = async () => {
        try {
            // Tải cùng lúc 3 loại dữ liệu: Lớp, Môn học, và Người dùng
            const [classData, subjectData, userData] = await Promise.all([
                classroomService.getAllClassrooms(),
                subjectService.getAllSubjects(),
                userService.getAllUsers()
            ]);
            
            setClassrooms(classData);
            setSubjects(subjectData);
            
            // Lọc ra những người dùng có quyền LECTURER (Giảng viên)
            const lecturerData = userData.filter(u => u.roles.some(r => r.name === 'LECTURER'));
            setLecturers(lecturerData);
            
            setLoading(false);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.subjectId) {
            alert("Vui lòng chọn môn học!");
            return;
        }
        try {
            await classroomService.createClassroom(formData);
            alert("✅ Tạo lớp học thành công!");
            setIsModalOpen(false);
            setFormData({ classCode: '', subjectId: '', lecturerId: '' });
            fetchData(); // Load lại danh sách mới
        } catch (error) {
            alert("❌ Lỗi: " + (error.response?.data || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Bạn có chắc muốn xóa lớp học này? Mọi dữ liệu của sinh viên trong lớp sẽ bị ảnh hưởng!")) {
            try {
                await classroomService.deleteClassroom(id);
                fetchData();
            } catch (error) {
                alert("❌ Lỗi xóa: " + error.message);
            }
        }
    };

    // Lọc lớp học theo từ khóa
    const filteredClassrooms = classrooms.filter(c => 
        (c.classCode || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.lecturer || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#004085', margin: 0 }}>Quản lý Lớp học</h2>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', top: '10px', left: '15px', color: '#999' }} />
                        <input 
                            type="text" 
                            placeholder="Tìm mã lớp, tên môn..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 15px 8px 40px', borderRadius: '20px', border: '1px solid #ccc', width: '250px', outline: 'none' }}
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                        + Tạo Lớp Mới
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
                {loading ? <p>Đang tải dữ liệu...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                <th style={{ padding: '15px', color: '#495057' }}>Mã Lớp</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Môn học</th>
                                <th style={{ padding: '15px', color: '#495057' }}>Giảng viên phụ trách</th>
                                <th style={{ padding: '15px', color: '#495057', textAlign: 'center' }}>Sĩ số</th>
                                <th style={{ padding: '15px', color: '#495057', textAlign: 'center' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClassrooms.length > 0 ? filteredClassrooms.map((cls) => (
                                <tr key={cls.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#28a745' }}>{cls.classCode}</td>
                                    <td style={{ padding: '15px', fontWeight: '500' }}>{cls.subject} <br/><span style={{fontSize: '12px', color: '#666'}}>{cls.subjectCode}</span></td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FaUserTie color="#0056b3" /> 
                                            <span style={{ fontWeight: cls.lecturer === 'Chưa phân công' ? 'normal' : 'bold', color: cls.lecturer === 'Chưa phân công' ? '#dc3545' : '#333' }}>
                                                {cls.lecturer}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <span style={{ 
                                            backgroundColor: cls.studentCount >= 10 ? '#f8d7da' : '#e2e3e5', 
                                            color: cls.studentCount >= 10 ? '#721c24' : '#383d41', 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' 
                                        }}>
                                            {cls.studentCount} / 10
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button onClick={() => handleDelete(cls.id)} style={{ background: 'transparent', border: '1px solid #dc3545', color: '#dc3545', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Chưa có lớp học nào. Hãy tạo lớp mới!</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* POPUP TẠO LỚP HỌC MỚI */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#004085' }}><FaChalkboard /> Tạo Lớp Học Mới</h3>
                            <FaTimes style={{ cursor: 'pointer', color: '#dc3545', fontSize: '20px' }} onClick={() => setIsModalOpen(false)} />
                        </div>
                        
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Mã Lớp Học (VD: IT01-WEB) (*)</label>
                                <input type="text" name="classCode" value={formData.classCode} onChange={handleInputChange} required placeholder="Nhập mã lớp..." style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            
                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Chọn Môn Học (*)</label>
                                <select name="subjectId" value={formData.subjectId} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                    <option value="">-- Click để chọn môn học --</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>[{sub.subjectCode}] {sub.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Phân công Giảng Viên</label>
                                <select name="lecturerId" value={formData.lecturerId} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                                    <option value="">-- Tạm thời chưa phân công --</option>
                                    {lecturers.map(lec => (
                                        <option key={lec.id} value={lec.id}>{lec.fullName} ({lec.username})</option>
                                    ))}
                                </select>
                            </div>
                            
                            <button type="submit" style={{ marginTop: '10px', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                                Tạo Lớp Học
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}