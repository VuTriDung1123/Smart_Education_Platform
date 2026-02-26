import React, { useEffect, useState, useRef } from 'react';
import lecturerService from '../services/lecturerService';
import userService from '../services/userService';
import LecturerLayout from '../components/LecturerLayout';
import { 
    FaSave, FaArrowLeft, FaEdit, FaFileExcel, FaFileExport, 
    FaLock, FaBullhorn, FaPaperPlane, FaTasks, FaGraduationCap, FaCheckCircle 
} from 'react-icons/fa';

export default function LecturerPortal() {
    const [activeTab, setActiveTab] = useState('MY_CLASSES');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [classes, setClasses] = useState([]);
    
    // State chi tiết lớp
    const [selectedClass, setSelectedClass] = useState(null);
    const [classSubTab, setClassSubTab] = useState('GRADES'); // 'GRADES', 'ANNOUNCEMENTS', 'ASSIGNMENTS'
    const [isGradesLocked, setIsGradesLocked] = useState(false);

    // State Bảng điểm
    const [students, setStudents] = useState([]);
    const [editGrades, setEditGrades] = useState({});
    const fileInputRef = useRef(null);

    // State Thông báo
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

    // State Bài tập & Khóa luận (Combo 2)
    const [assignments, setAssignments] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', deadline: '' });
    const [theses, setTheses] = useState([]);

    const fetchLecturerData = async () => {
        try {
            const loggedInUsername = localStorage.getItem('username');
            console.log("👉 Đang tìm ID cho username:", loggedInUsername);
            
            const users = await userService.getAllUsers(); 
            const me = users.find(u => u.username === loggedInUsername);
            
            if (me) {
                console.log("✅ Tìm thấy ID giảng viên:", me.id);
                setCurrentUserId(me.id); 
                
                // Gọi API lấy danh sách lớp học
                const classData = await lecturerService.getMyClasses(me.id);
                console.log("✅ Danh sách lớp tải về:", classData);
                setClasses(classData);

                // Gọi API lấy danh sách Đồ án hướng dẫn
                try {
                    const thesesData = await lecturerService.getMyTheses(me.id);
                    setTheses(thesesData);
                } catch (error) {
                    console.log("Chưa có đồ án hoặc lỗi load đồ án:", error);
                }
            } else {
                console.error("❌ Không tìm thấy user trong danh sách!");
                alert("Không tìm thấy tài khoản của bạn trong hệ thống!");
            }
        } catch (error) { 
            console.error("❌ Lỗi API ở Giảng Viên:", error); 
            alert("Lỗi tải lớp học: " + error.message);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchLecturerData();
    }, []);

    const handleSelectClass = async (cls) => {
        setSelectedClass(cls);
        setClassSubTab('GRADES'); // Mặc định vào tab bảng điểm
        setIsGradesLocked(false); 
        fetchStudents(cls.classId);
        fetchAnnouncements(cls.classId);
        fetchAssignments(cls.classId);
    };

    // ==========================================
    // DATA FETCHERS
    // ==========================================
    const fetchStudents = async (classId) => {
        try {
            const studentData = await lecturerService.getStudentsInClass(classId);
            setStudents(studentData);
            const initialEdits = {};
            studentData.forEach(s => {
                initialEdits[`${s.studentId}_process`] = s.processScore !== null ? s.processScore : '';
                initialEdits[`${s.studentId}_final`] = s.finalScore !== null ? s.finalScore : '';
            });
            setEditGrades(initialEdits);
        } catch (error) { console.error("Lỗi:", error); }
    };

    const fetchAnnouncements = async (classId) => {
        try {
            setAnnouncements(await lecturerService.getAnnouncements(classId));
        } catch (error) { console.error("Lỗi:", error); }
    };

    const fetchAssignments = async (classId) => {
        try {
            setAssignments(await lecturerService.getAssignments(classId));
        } catch (error) { console.error("Lỗi:", error); }
    };

    // ==========================================
    // ACTION: BẢNG ĐIỂM
    // ==========================================
    const handleGradeChange = (studentId, type, value) => {
        if (isGradesLocked) return;
        setEditGrades(prev => ({ ...prev, [`${studentId}_${type}`]: value }));
    };

    const handleSaveGrades = async () => {
        if (isGradesLocked) return alert("Bảng điểm đã bị khóa!");
        try {
            for (const student of students) {
                const pScore = editGrades[`${student.studentId}_process`];
                const fScore = editGrades[`${student.studentId}_final`];
                if (pScore !== '' || fScore !== '') {
                    await lecturerService.saveGrades(selectedClass.classId, student.studentId, {
                        processScore: pScore !== '' ? parseFloat(pScore) : null,
                        finalScore: fScore !== '' ? parseFloat(fScore) : null
                    });
                }
            }
            alert("✅ Đã lưu điểm thành công!");
            fetchStudents(selectedClass.classId);
        } catch (error) { alert("❌ Có lỗi xảy ra khi lưu điểm: " + error.message); }
    };

    const handleLockGrades = async () => {
        if (window.confirm("⚠️ Sau khi khóa, bạn sẽ KHÔNG THỂ sửa điểm nữa. Xác nhận khóa?")) {
            try {
                await lecturerService.lockGrades(selectedClass.classId);
                setIsGradesLocked(true);
                alert("✅ Đã khóa bảng điểm!");
            } catch (error) { alert("Lỗi khóa điểm: " + error.message); }
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const msg = await lecturerService.importGradesExcel(selectedClass.classId, file);
            alert(msg);
            fetchStudents(selectedClass.classId);
        } catch (error) { alert("❌ Lỗi Import: " + error.message); }
    };

    const handleExportExcel = () => {
        window.open(`http://localhost:8080/api/lecturer/actions/classes/${selectedClass.classId}/export-grades`);
    };

    // ==========================================
    // ACTION: THÔNG BÁO & BÀI TẬP & ĐỒ ÁN
    // ==========================================
    const handleSendAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await lecturerService.createAnnouncement(selectedClass.classId, currentUserId, newAnnouncement);
            setNewAnnouncement({ title: '', content: '' });
            fetchAnnouncements(selectedClass.classId);
            alert("✅ Đã gửi thông báo cho lớp!");
        } catch (error) { alert("❌ Lỗi gửi thông báo: " + error.message); }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await lecturerService.createAssignment(selectedClass.classId, newAssignment);
            setNewAssignment({ title: '', description: '', deadline: '' });
            fetchAssignments(selectedClass.classId);
            alert("✅ Đã giao bài tập mới thành công!");
        } catch (error) { alert("❌ Lỗi giao bài tập: " + error.message); }
    };

    const handleGradeThesis = async (thesisId) => {
        const score = prompt("Nhập điểm đánh giá (0-10) cho Đồ án này:");
        if (score) {
            try {
                await lecturerService.gradeThesis(thesisId, { score });
                alert("✅ Đã cập nhật điểm đồ án!");
                fetchLecturerData(); // Load lại danh sách
            } catch (error) { alert("Lỗi chấm điểm: " + error.message); }
        }
    };

    // ==========================================
    // RENDERS
    // ==========================================
    const renderDashboard = () => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #1A237E', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Tổng số lớp phụ trách</h4>
                <h2 style={{ color: '#1A237E', margin: 0, fontSize: '32px' }}>{classes.length}</h2>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #FF6D00', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Đồ án đang Hướng dẫn</h4>
                <h2 style={{ color: '#FF6D00', margin: 0, fontSize: '32px' }}>{theses.length}</h2>
            </div>
        </div>
    );

    const renderClassDetail = () => {
        if (!selectedClass) return null;

        return (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '25px', animation: 'fadeIn 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <button onClick={() => setSelectedClass(null)} style={{ background: 'none', border: 'none', color: '#1A237E', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0, marginBottom: '10px' }}>
                            <FaArrowLeft /> Trở về danh sách lớp
                        </button>
                        <h3 style={{ margin: 0, color: '#1A237E', fontSize: '22px' }}>{selectedClass.subjectName}</h3>
                        <span style={{ backgroundColor: '#f0f2f5', padding: '3px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold' }}>{selectedClass.classCode}</span>
                    </div>
                </div>

                {/* Sub-Tabs cho Lớp học */}
                <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
                    <div onClick={() => setClassSubTab('GRADES')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'GRADES' ? '3px solid #FF6D00' : '3px solid transparent', color: classSubTab === 'GRADES' ? '#FF6D00' : '#666' }}>
                        <FaEdit /> Bảng điểm sinh viên
                    </div>
                    <div onClick={() => setClassSubTab('ASSIGNMENTS')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ASSIGNMENTS' ? '3px solid #28a745' : '3px solid transparent', color: classSubTab === 'ASSIGNMENTS' ? '#28a745' : '#666' }}>
                        <FaTasks /> Bài tập ({assignments.length})
                    </div>
                    <div onClick={() => setClassSubTab('ANNOUNCEMENTS')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ANNOUNCEMENTS' ? '3px solid #1A237E' : '3px solid transparent', color: classSubTab === 'ANNOUNCEMENTS' ? '#1A237E' : '#666' }}>
                        <FaBullhorn /> Thông báo lớp ({announcements.length})
                    </div>
                </div>

                {/* Giao diện BẢNG ĐIỂM */}
                {classSubTab === 'GRADES' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleExportExcel} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}><FaFileExport /> Xuất File Mẫu</button>
                                <input type="file" accept=".xlsx" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImportExcel} />
                                {!isGradesLocked && <button onClick={() => fileInputRef.current.click()} style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}><FaFileExcel /> Import Điểm</button>}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {!isGradesLocked && <button onClick={handleSaveGrades} style={{ backgroundColor: '#FF6D00', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><FaSave /> Lưu Nháp</button>}
                                <button onClick={handleLockGrades} disabled={isGradesLocked} style={{ backgroundColor: isGradesLocked ? '#6c757d' : '#dc3545', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: isGradesLocked ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaLock /> {isGradesLocked ? 'Bảng điểm đã khóa' : 'Khóa Bảng Điểm'}
                                </button>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1A237E', color: 'white' }}>
                                    <th style={{ padding: '12px' }}>STT</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>MSSV</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Họ và Tên</th>
                                    <th style={{ padding: '12px', width: '150px' }}>Điểm Q.Trình (40%)</th>
                                    <th style={{ padding: '12px', width: '150px' }}>Điểm Thi (60%)</th>
                                    <th style={{ padding: '12px' }}>Điểm Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? <tr><td colSpan="6" style={{ padding: '20px' }}>Chưa có sinh viên nào.</td></tr> : students.map((s, index) => {
                                    const p = parseFloat(editGrades[`${s.studentId}_process`]);
                                    const f = parseFloat(editGrades[`${s.studentId}_final`]);
                                    let total = '-';
                                    if (!isNaN(p) && !isNaN(f)) total = (p * 0.4 + f * 0.6).toFixed(1);

                                    return (
                                        <tr key={s.studentId} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{index + 1}</td>
                                            <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>{s.studentCode}</td>
                                            <td style={{ padding: '12px', textAlign: 'left' }}>{s.fullName}</td>
                                            <td style={{ padding: '12px' }}>
                                                <input type="number" min="0" max="10" step="0.1" value={editGrades[`${s.studentId}_process`]} onChange={e => handleGradeChange(s.studentId, 'process', e.target.value)} disabled={isGradesLocked} style={{ width: '80%', padding: '8px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: isGradesLocked ? '#f0f2f5' : 'white' }} />
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <input type="number" min="0" max="10" step="0.1" value={editGrades[`${s.studentId}_final`]} onChange={e => handleGradeChange(s.studentId, 'final', e.target.value)} disabled={isGradesLocked} style={{ width: '80%', padding: '8px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: isGradesLocked ? '#f0f2f5' : 'white' }} />
                                            </td>
                                            <td style={{ padding: '12px', fontWeight: 'bold', color: total >= 4 ? '#28a745' : '#dc3545' }}>{total}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Giao diện BÀI TẬP */}
                {classSubTab === 'ASSIGNMENTS' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                            <h4 style={{ margin: '0 0 15px 0' }}>Giao Bài tập mới</h4>
                            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input type="text" placeholder="Tên bài tập..." required value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                <input type="datetime-local" required value={newAssignment.deadline} onChange={e => setNewAssignment({...newAssignment, deadline: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                <textarea rows="4" placeholder="Mô tả yêu cầu..." required value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />
                                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    <FaPaperPlane /> Giao Bài Tập
                                </button>
                            </form>
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 15px 0' }}>Danh sách Bài tập đã giao</h4>
                            {assignments.length === 0 ? <p style={{ color: '#888' }}>Chưa có bài tập nào.</p> : assignments.map(a => (
                                <div key={a.id} style={{ backgroundColor: 'white', border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #28a745', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{a.title}</h4>
                                        <p style={{ margin: '5px 0', color: '#555', fontSize: '14px' }}>{a.description}</p>
                                        <span style={{ fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>Hạn chót: {new Date(a.deadline).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <div style={{ textAlign: 'center', backgroundColor: '#eef2ff', padding: '10px', borderRadius: '8px', minWidth: '80px' }}>
                                        <h3 style={{ margin: 0, color: '#1A237E' }}>{a.submittedCount}</h3>
                                        <span style={{ fontSize: '12px', color: '#666' }}>Bài nộp</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Giao diện THÔNG BÁO LỚP */}
                {classSubTab === 'ANNOUNCEMENTS' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                            <h4 style={{ margin: '0 0 15px 0' }}>Soạn thông báo mới</h4>
                            <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input type="text" placeholder="Tiêu đề..." required value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                <textarea rows="5" placeholder="Nội dung thông báo (nghỉ học, dời lịch, v.v.)..." required value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />
                                <button type="submit" style={{ padding: '10px', backgroundColor: '#1A237E', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    <FaPaperPlane /> Gửi cho Sinh viên
                                </button>
                            </form>
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 15px 0' }}>Lịch sử thông báo</h4>
                            {announcements.length === 0 ? <p style={{ color: '#888' }}>Chưa có thông báo nào được gửi.</p> : announcements.map(a => (
                                <div key={a.id} style={{ backgroundColor: 'white', border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #1A237E' }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{a.title}</h4>
                                    <span style={{ fontSize: '12px', color: '#888' }}>{new Date(a.createdAt).toLocaleString('vi-VN')}</span>
                                    <p style={{ margin: '10px 0 0 0', color: '#555', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{a.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <LecturerLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <div style={{ animation: 'fadeIn 0.5s' }}>
                {activeTab === 'DASHBOARD' && renderDashboard()}
                
                {activeTab === 'MY_CLASSES' && (selectedClass ? renderClassDetail() : 
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {classes.length === 0 ? <p>Bạn chưa phụ trách lớp nào.</p> : classes.map(c => (
                            <div key={c.classId} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, color: '#1A237E' }}>{c.classCode}</h3>
                                    <span style={{ backgroundColor: '#eef2ff', color: '#1A237E', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{c.studentCount} SV</span>
                                </div>
                                <h4 style={{ margin: '0 0 20px 0', color: '#444' }}>{c.subjectName}</h4>
                                <button onClick={() => handleSelectClass(c)} style={{ marginTop: 'auto', backgroundColor: '#1A237E', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                                    <FaEdit /> Quản lý Lớp học
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Giao diện KHÓA LUẬN / ĐỒ ÁN (COMBO 2) */}
                {activeTab === 'THESIS' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ color: '#1A237E', margin: 0 }}><FaGraduationCap /> Sinh viên thực hiện Khóa luận / Đồ án</h2>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1A237E', color: 'white' }}>
                                        <th style={{ padding: '15px' }}>Tên Đề tài (Topic)</th>
                                        <th style={{ padding: '15px' }}>Nhóm Sinh viên</th>
                                        <th style={{ padding: '15px' }}>Trạng thái</th>
                                        <th style={{ padding: '15px', textAlign: 'center' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {theses.length === 0 ? <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Bạn chưa được phân công hướng dẫn đồ án nào.</td></tr> : theses.map(t => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>{t.title}</td>
                                            <td style={{ padding: '15px', color: '#666' }}>{t.studentName}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{t.status}</span>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                <button onClick={() => handleGradeThesis(t.id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}>
                                                    <FaCheckCircle /> Đánh giá
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </LecturerLayout>
    );
}