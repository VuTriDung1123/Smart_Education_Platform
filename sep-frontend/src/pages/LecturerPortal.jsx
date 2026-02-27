import { useEffect, useRef, useState } from 'react';
import {
    FaArrowLeft,
    FaBullhorn,
    FaChartLine,
    FaEdit,
    FaExclamationTriangle,
    FaFileExcel, FaFileExport,
    FaGraduationCap,
    FaLock,
    FaPaperPlane,
    FaQrcode,
    FaSave,
    FaTasks
} from 'react-icons/fa';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LecturerLayout from '../components/LecturerLayout';
import lecturerService from '../services/lecturerService';
import userService from '../services/userService';

export default function LecturerPortal() {
    const [activeTab, setActiveTab] = useState('MY_CLASSES');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [classes, setClasses] = useState([]);
    
    const [selectedClass, setSelectedClass] = useState(null);
    const [classSubTab, setClassSubTab] = useState('GRADES'); 
    const [isGradesLocked, setIsGradesLocked] = useState(false);

    const [students, setStudents] = useState([]);
    const [editGrades, setEditGrades] = useState({});
    const fileInputRef = useRef(null);
    
    const [announcements, setAnnouncements] = useState([]); // Đã fix lỗi dính chữ ở đây
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    
    const [assignments, setAssignments] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', deadline: '' });
    
    const [theses, setTheses] = useState([]);
    const [qrSession, setQrSession] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    // State quản lý xem chi tiết bài nộp
    const [activeAssignmentId, setActiveAssignmentId] = useState(null);
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [gradeInputs, setGradeInputs] = useState({}); 

    const fetchLecturerData = async () => {
        try {
            const loggedInUsername = localStorage.getItem('username');
            const users = await userService.getAllUsers(); 
            const me = users.find(u => u.username === loggedInUsername);
            
            if (me) {
                setCurrentUserId(me.id); 
                const classData = await lecturerService.getMyClasses(me.id);
                setClasses(classData);
                try { 
                    const thesesData = await lecturerService.getMyTheses(me.id);
                    setTheses(thesesData); 
                } catch {
                    console.log("Lecturer currently has no theses.");
                }
            }
        } catch { 
            alert("Lỗi tải thông tin Giảng viên hoặc Lớp học."); 
        }
    };

    useEffect(() => {
        fetchLecturerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectClass = async (cls) => {
        setSelectedClass(cls);
        setClassSubTab('GRADES');
        setIsGradesLocked(false); 
        setQrSession(null);
        setActiveAssignmentId(null); // Reset màn hình bài nộp khi đổi lớp
        fetchStudents(cls.classId);
        fetchAnnouncements(cls.classId);
        fetchAssignments(cls.classId);
        fetchAnalytics(cls.classId);
    };

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
        } catch { console.error("Error fetching students"); }
    };
    
    const fetchAnnouncements = async (classId) => { 
        try { 
            const data = await lecturerService.getAnnouncements(classId);
            setAnnouncements(data); 
        } catch { console.error("Error fetching announcements"); } 
    };
    
    const fetchAssignments = async (classId) => { 
        try { 
            const data = await lecturerService.getAssignments(classId);
            setAssignments(data); 
        } catch { console.error("Error fetching assignments"); } 
    };
    
    const fetchAnalytics = async (classId) => { 
        try { 
            const data = await lecturerService.getClassAnalytics(classId);
            setAnalytics(data); 
        } catch { console.error("Error fetching analytics"); } 
    };

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
        } catch { alert("❌ Có lỗi xảy ra khi lưu điểm!"); }
    };
    
    const handleLockGrades = async () => {
        if (window.confirm("⚠️ Khóa điểm?")) {
            try { 
                await lecturerService.lockGrades(selectedClass.classId); 
                setIsGradesLocked(true); 
                alert("Đã khóa!"); 
            } catch { alert("Lỗi khi khóa điểm"); }
        }
    };
    
    const handleImportExcel = async (e) => {
        if (!e.target.files[0]) return;
        try { 
            await lecturerService.importGradesExcel(selectedClass.classId, e.target.files[0]); 
            fetchStudents(selectedClass.classId); 
        } catch { alert("Lỗi khi import điểm"); }
    };
    
    const handleExportExcel = () => window.open(`http://localhost:8080/api/lecturer/actions/classes/${selectedClass.classId}/export-grades`);

    const handleSendAnnouncement = async (e) => {
        e.preventDefault();
        try { 
            await lecturerService.createAnnouncement(selectedClass.classId, currentUserId, newAnnouncement); 
            setNewAnnouncement({ title: '', content: '' }); 
            fetchAnnouncements(selectedClass.classId); 
        } catch { alert("Lỗi gửi thông báo"); }
    };
    
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try { 
            await lecturerService.createAssignment(selectedClass.classId, newAssignment); 
            setNewAssignment({ title: '', description: '', deadline: '' }); 
            fetchAssignments(selectedClass.classId); 
        } catch { alert("Lỗi giao bài tập"); }
    };
    
    const handleGradeThesis = async (thesisId) => {
        const score = prompt("Nhập điểm đánh giá (0-10):");
        if (score) { 
            try { 
                await lecturerService.gradeThesis(thesisId, { score: parseFloat(score) }); 
                fetchLecturerData(); 
            } catch { alert("Lỗi cập nhật điểm đồ án"); } 
        }
    };

    const handleGenerateQR = async () => {
        try {
            const res = await lecturerService.generateQrAttendance(selectedClass.classId);
            setQrSession(res);
        } catch { alert("❌ Lỗi tạo mã QR"); }
    };

    // ===============================================
    // HÀM XỬ LÝ BÀI NỘP (SUBMISSIONS)
    // ===============================================
    const handleViewSubmissions = async (assignmentId) => {
        try {
            const data = await lecturerService.getAssignmentSubmissions(assignmentId);
            setSubmissionDetails(data);
            setActiveAssignmentId(assignmentId);
            
            const initialGrades = {};
            data.submissions.forEach(sub => {
                if (sub.score !== null) initialGrades[sub.submissionId] = sub.score;
            });
            setGradeInputs(initialGrades);
        } catch (error) {
            console.error("Lỗi lấy danh sách bài nộp:", error);
            alert("Lỗi tải danh sách bài nộp");
        }
    };

    const handleSaveGrade = async (submissionId) => {
        const score = gradeInputs[submissionId];
        if (score === undefined || score === '' || score < 0 || score > 10) {
            alert("Vui lòng nhập điểm hợp lệ (0 - 10)");
            return;
        }

        try {
            await lecturerService.gradeSubmission(submissionId, { score: parseFloat(score) });
            alert("✅ Đã lưu điểm thành công!");
            handleViewSubmissions(activeAssignmentId); // Reload lại data
        } catch (error) {
            alert("❌ Lỗi khi lưu điểm!");
        }
    };

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

                <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #eee', marginBottom: '20px', overflowX: 'auto' }}>
                    <div onClick={() => setClassSubTab('GRADES')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'GRADES' ? '3px solid #FF6D00' : '3px solid transparent', color: classSubTab === 'GRADES' ? '#FF6D00' : '#666', whiteSpace: 'nowrap' }}>
                        <FaEdit /> Bảng điểm
                    </div>
                    <div onClick={() => setClassSubTab('ATTENDANCE')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ATTENDANCE' ? '3px solid #6f42c1' : '3px solid transparent', color: classSubTab === 'ATTENDANCE' ? '#6f42c1' : '#666', whiteSpace: 'nowrap' }}>
                        <FaQrcode /> Điểm danh QR
                    </div>
                    <div onClick={() => {setClassSubTab('ASSIGNMENTS'); setActiveAssignmentId(null);}} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ASSIGNMENTS' ? '3px solid #28a745' : '3px solid transparent', color: classSubTab === 'ASSIGNMENTS' ? '#28a745' : '#666', whiteSpace: 'nowrap' }}>
                        <FaTasks /> Bài tập ({assignments.length})
                    </div>
                    <div onClick={() => setClassSubTab('ANALYTICS')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ANALYTICS' ? '3px solid #17a2b8' : '3px solid transparent', color: classSubTab === 'ANALYTICS' ? '#17a2b8' : '#666', whiteSpace: 'nowrap' }}>
                        <FaChartLine /> Thống kê lớp
                    </div>
                    <div onClick={() => setClassSubTab('ANNOUNCEMENTS')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ANNOUNCEMENTS' ? '3px solid #1A237E' : '3px solid transparent', color: classSubTab === 'ANNOUNCEMENTS' ? '#1A237E' : '#666', whiteSpace: 'nowrap' }}>
                        <FaBullhorn /> Thông báo
                    </div>
                </div>

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
                                            <td style={{ padding: '12px' }}><input type="number" min="0" max="10" step="0.1" value={editGrades[`${s.studentId}_process`]} onChange={e => handleGradeChange(s.studentId, 'process', e.target.value)} disabled={isGradesLocked} style={{ width: '80%', padding: '8px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: isGradesLocked ? '#f0f2f5' : 'white' }} /></td>
                                            <td style={{ padding: '12px' }}><input type="number" min="0" max="10" step="0.1" value={editGrades[`${s.studentId}_final`]} onChange={e => handleGradeChange(s.studentId, 'final', e.target.value)} disabled={isGradesLocked} style={{ width: '80%', padding: '8px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: isGradesLocked ? '#f0f2f5' : 'white' }} /></td>
                                            <td style={{ padding: '12px', fontWeight: 'bold', color: total >= 4 ? '#28a745' : '#dc3545' }}>{total}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </>
                )}

                {classSubTab === 'ATTENDANCE' && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <h3 style={{ color: '#6f42c1', marginBottom: '10px' }}><FaQrcode size={30} /> Hệ thống Điểm danh Realtime</h3>
                        <p style={{ color: '#666', marginBottom: '30px' }}>Mã QR sẽ tự động thay đổi sau mỗi 60 giây để chống gian lận điểm danh hộ.</p>
                        
                        {!qrSession ? (
                            <button onClick={handleGenerateQR} style={{ backgroundColor: '#6f42c1', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(111, 66, 193, 0.4)' }}>
                                Kích hoạt phiên Điểm danh
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ border: '5px solid #6f42c1', padding: '15px', borderRadius: '20px', backgroundColor: 'white', display: 'inline-block' }}>
                                    <img src={qrSession.qrUrl} alt="QR Điểm Danh" style={{ width: '300px', height: '300px' }} />
                                </div>
                                <h2 style={{ color: '#dc3545', margin: '20px 0' }}>⏳ Thời gian còn lại: 59s</h2>
                                <button onClick={() => setQrSession(null)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Đóng QR (Kết thúc điểm danh)
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {classSubTab === 'ANALYTICS' && analytics && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                            <h4 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#333' }}>Phổ điểm sinh viên (Score Distribution)</h4>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.scoreDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="count" fill="#17a2b8" radius={[5, 5, 0, 0]} name="Số lượng SV" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ backgroundColor: '#fff3cd', borderLeft: '5px solid #ffc107', padding: '20px', borderRadius: '8px' }}>
                                <h4 style={{ color: '#856404', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><FaExclamationTriangle /> Cảnh báo Học thuật</h4>
                                <p style={{ margin: 0, color: '#666' }}>Có <strong>{analytics.riskStudents} sinh viên</strong> có nguy cơ rớt môn (Điểm dưới 4 hoặc vắng quá 20%).</p>
                            </div>
                            
                            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #eee', flex: 1 }}>
                                <h4 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#333' }}>Tỷ lệ Chuyên cần</h4>
                                <div style={{ height: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={analytics.attendanceRate} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                                                {analytics.attendanceRate.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB BÀI TẬP VÀ XEM BÀI NỘP */}
                {classSubTab === 'ASSIGNMENTS' && (
                    <div>
                        {activeAssignmentId && submissionDetails ? (
                            /* MÀN HÌNH 2: CHI TIẾT BÀI NỘP */
                            <div style={{ animation: 'fadeIn 0.3s' }}>
                                <button onClick={() => setActiveAssignmentId(null)} style={{ background: 'none', border: 'none', color: '#006666', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', padding: 0 }}>
                                    <FaArrowLeft /> Trở về danh sách Bài tập
                                </button>
                                
                                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #006666', marginBottom: '20px' }}>
                                    <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{submissionDetails.assignmentTitle}</h2>
                                    <span style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '14px' }}>Hạn chót: {submissionDetails.deadline ? new Date(submissionDetails.deadline).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                    <thead style={{ backgroundColor: '#006666', color: 'white' }}>
                                        <tr>
                                            <th style={{ padding: '15px', textAlign: 'left' }}>MSSV</th>
                                            <th style={{ padding: '15px', textAlign: 'left' }}>Họ và Tên</th>
                                            <th style={{ padding: '15px', textAlign: 'center' }}>Trạng thái</th>
                                            <th style={{ padding: '15px', textAlign: 'center' }}>Bài làm</th>
                                            <th style={{ padding: '15px', textAlign: 'center' }}>Chấm điểm</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissionDetails.submissions.map((sub, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#555' }}>{sub.studentCode}</td>
                                                <td style={{ padding: '15px' }}>{sub.fullName}</td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    {sub.status === 'ON_TIME' && <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>Đúng hạn</span>}
                                                    {sub.status === 'LATE' && <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>Nộp trễ</span>}
                                                    {sub.status === 'MISSING' && <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>Chưa nộp</span>}
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    {sub.fileUrl ? (
                                                        <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>🔗 Xem File</a>
                                                    ) : <span style={{ color: '#ccc' }}>-</span>}
                                                </td>
                                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                                    {sub.status !== 'MISSING' ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                            <input 
                                                                type="number" min="0" max="10" step="0.5"
                                                                value={gradeInputs[sub.submissionId] || ''}
                                                                onChange={(e) => setGradeInputs({...gradeInputs, [sub.submissionId]: e.target.value})}
                                                                style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                                                                placeholder="0-10"
                                                            />
                                                            <button onClick={() => handleSaveGrade(sub.submissionId)} style={{ backgroundColor: '#006666', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                                Lưu
                                                            </button>
                                                        </div>
                                                    ) : <span style={{ color: '#ccc', fontStyle: 'italic' }}>Không thể chấm</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* MÀN HÌNH 1: DANH SÁCH BÀI TẬP VÀ FORM GIAO BÀI */
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', animation: 'fadeIn 0.3s' }}>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                                    <h4 style={{ margin: '0 0 15px 0' }}>Giao Bài tập mới</h4>
                                    <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <input type="text" placeholder="Tên bài tập..." required value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                        <input type="datetime-local" required value={newAssignment.deadline} onChange={e => setNewAssignment({...newAssignment, deadline: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                        <textarea rows="4" placeholder="Mô tả..." required value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}><FaPaperPlane /> Giao Bài Tập</button>
                                    </form>
                                </div>
                                <div>
                                    {assignments.map(a => (
                                        <div key={a.id} style={{ backgroundColor: 'white', border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: '5px solid #ffc107', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{a.title}</h3>
                                                <p style={{ margin: '0 0 10px 0', color: '#555', fontSize: '14px' }}>{a.description}</p>
                                                <span style={{ fontSize: '13px', color: '#dc3545', fontWeight: 'bold' }}>Hạn chót: {a.deadline ? new Date(a.deadline).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ marginBottom: '10px', fontSize: '14px', color: '#006666', fontWeight: 'bold' }}>
                                                    Đã nộp: {a.submittedCount} SV
                                                </div>
                                                <button onClick={() => handleViewSubmissions(a.id)} style={{ backgroundColor: '#f8f9fa', border: '1px solid #006666', color: '#006666', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                    Xem Bài Nộp
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {assignments.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>Chưa có bài tập nào được giao.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {classSubTab === 'ANNOUNCEMENTS' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                            <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input type="text" placeholder="Tiêu đề..." required value={newAnnouncement.title} onChange={e => setNewAssignment({...newAnnouncement, title: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                <textarea rows="5" placeholder="Nội dung..." required value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                <button type="submit" style={{ padding: '10px', backgroundColor: '#1A237E', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}><FaPaperPlane /> Gửi</button>
                            </form>
                        </div>
                        <div>
                            {announcements.map(a => (
                                <div key={a.id} style={{ backgroundColor: 'white', border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #1A237E' }}>
                                    <h4>{a.title}</h4><p>{a.content}</p>
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
                {activeTab === 'MY_CLASSES' && (selectedClass ? renderClassDetail() : 
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {classes.length === 0 ? <p>Chưa phụ trách lớp nào.</p> : classes.map(c => (
                            <div key={c.classId} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#1A237E' }}>{c.classCode}</h3>
                                <h4 style={{ margin: '0 0 20px 0', color: '#444' }}>{c.subjectName}</h4>
                                <button onClick={() => handleSelectClass(c)} style={{ marginTop: 'auto', backgroundColor: '#1A237E', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    <FaEdit /> Quản lý Lớp học
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'THESIS' && (
                    <div>
                        <h2 style={{ color: '#1A237E', marginTop: 0 }}><FaGraduationCap /> Hướng dẫn Đồ án</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white' }}>
                            <thead><tr style={{ backgroundColor: '#1A237E', color: 'white' }}>
                                <th style={{ padding: '15px' }}>Đề tài</th><th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                            </tr></thead>
                            <tbody>
                                {theses.map(t => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>{t.title}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}><button onClick={() => handleGradeThesis(t.id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer' }}>Đánh giá</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </LecturerLayout>
    );
}