import React, { useEffect, useState } from 'react';
import lecturerService from '../services/lecturerService';
import userService from '../services/userService';
import LecturerLayout from '../components/LecturerLayout';
import { FaSave, FaArrowLeft, FaEdit } from 'react-icons/fa';

export default function LecturerPortal() {
    const [activeTab, setActiveTab] = useState('MY_CLASSES');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [classes, setClasses] = useState([]);
    
    // State cho việc chấm điểm
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [editGrades, setEditGrades] = useState({}); // Lưu tạm điểm đang gõ

    useEffect(() => {
        fetchLecturerData();
    }, []);

    const fetchLecturerData = async () => {
        try {
            const loggedInUsername = localStorage.getItem('username');
            const users = await userService.getAllUsers();
            const me = users.find(u => u.username === loggedInUsername);
            
            if (me) {
                setCurrentUserId(me.id);
                const classData = await lecturerService.getMyClasses(me.id);
                setClasses(classData);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu giảng viên:", error);
        }
    };

    const handleSelectClass = async (cls) => {
        setSelectedClass(cls);
        try {
            const studentData = await lecturerService.getStudentsInClass(cls.classId);
            setStudents(studentData);
            
            // Đổ điểm cũ vào form edit
            const initialEdits = {};
            studentData.forEach(s => {
                initialEdits[`${s.studentId}_process`] = s.processScore !== null ? s.processScore : '';
                initialEdits[`${s.studentId}_final`] = s.finalScore !== null ? s.finalScore : '';
            });
            setEditGrades(initialEdits);
        } catch (error) {
            console.error("Lỗi tải danh sách sinh viên:", error);
        }
    };

    const handleGradeChange = (studentId, type, value) => {
        setEditGrades(prev => ({
            ...prev,
            [`${studentId}_${type}`]: value
        }));
    };

    const handleSaveGrades = async () => {
        try {
            // Duyệt qua từng sinh viên để lưu điểm
            for (const student of students) {
                const pScore = editGrades[`${student.studentId}_process`];
                const fScore = editGrades[`${student.studentId}_final`];
                
                // Chỉ lưu nếu giảng viên có nhập số
                if (pScore !== '' || fScore !== '') {
                    await lecturerService.saveGrades(selectedClass.classId, student.studentId, {
                        processScore: pScore !== '' ? parseFloat(pScore) : null,
                        finalScore: fScore !== '' ? parseFloat(fScore) : null
                    });
                }
            }
            alert("✅ Đã lưu điểm thành công!");
            handleSelectClass(selectedClass); // Tải lại điểm mới nhất
        } catch (error) {
            alert("❌ Có lỗi xảy ra khi lưu điểm!");
            console.error(error);
        }
    };

    const renderDashboard = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #1A237E', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Tổng số lớp phụ trách</h4>
                <h2 style={{ color: '#1A237E', margin: 0, fontSize: '32px' }}>{classes.length}</h2>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #FF6D00', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Tổng số sinh viên</h4>
                <h2 style={{ color: '#FF6D00', margin: 0, fontSize: '32px' }}>
                    {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                </h2>
            </div>
        </div>
    );

    const renderMyClasses = () => {
        if (selectedClass) {
            return (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f0f2f5', paddingBottom: '15px' }}>
                        <div>
                            <button onClick={() => setSelectedClass(null)} style={{ background: 'none', border: 'none', color: '#1A237E', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0, marginBottom: '10px' }}>
                                <FaArrowLeft /> Quay lại danh sách lớp
                            </button>
                            <h3 style={{ margin: 0, color: '#1A237E' }}>Môn: {selectedClass.subjectName}</h3>
                            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Mã lớp: {selectedClass.classCode}</p>
                        </div>
                        <button onClick={handleSaveGrades} style={{ backgroundColor: '#FF6D00', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                            <FaSave /> Lưu toàn bộ điểm
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1A237E', color: 'white' }}>
                                <th style={{ padding: '12px' }}>STT</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>MSSV</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Họ và Tên</th>
                                <th style={{ padding: '12px', width: '150px' }}>Điểm Quá trình (40%)</th>
                                <th style={{ padding: '12px', width: '150px' }}>Điểm Thi (60%)</th>
                                <th style={{ padding: '12px' }}>Điểm Tổng (Auto)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px' }}>Chưa có sinh viên nào đăng ký lớp này.</td></tr>
                            ) : students.map((s, index) => {
                                const p = parseFloat(editGrades[`${s.studentId}_process`]);
                                const f = parseFloat(editGrades[`${s.studentId}_final`]);
                                let total = '-';
                                if (!isNaN(p) && !isNaN(f)) {
                                    total = (p * 0.4 + f * 0.6).toFixed(1);
                                }

                                return (
                                    <tr key={s.studentId} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>{s.studentCode}</td>
                                        <td style={{ padding: '12px', textAlign: 'left' }}>{s.fullName}</td>
                                        <td style={{ padding: '12px' }}>
                                            <input 
                                                type="number" min="0" max="10" step="0.1"
                                                value={editGrades[`${s.studentId}_process`]} 
                                                onChange={e => handleGradeChange(s.studentId, 'process', e.target.value)}
                                                style={{ width: '80%', padding: '8px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input 
                                                type="number" min="0" max="10" step="0.1"
                                                value={editGrades[`${s.studentId}_final`]} 
                                                onChange={e => handleGradeChange(s.studentId, 'final', e.target.value)}
                                                style={{ width: '80%', padding: '8px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: total >= 4 ? '#28a745' : '#dc3545' }}>
                                            {total}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {classes.length === 0 ? <p>Bạn chưa được phân công phụ trách lớp nào.</p> : classes.map(c => (
                    <div key={c.classId} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#1A237E' }}>{c.classCode}</h3>
                            <span style={{ backgroundColor: '#eef2ff', color: '#1A237E', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{c.studentCount} SV</span>
                        </div>
                        <h4 style={{ margin: '0 0 20px 0', color: '#444' }}>{c.subjectName}</h4>
                        <button onClick={() => handleSelectClass(c)} style={{ marginTop: 'auto', backgroundColor: '#1A237E', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                            <FaEdit /> Nhập điểm
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <LecturerLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <div style={{ animation: 'fadeIn 0.5s' }}>
                {activeTab === 'DASHBOARD' && renderDashboard()}
                {activeTab === 'MY_CLASSES' && renderMyClasses()}
            </div>
        </LecturerLayout>
    );
}