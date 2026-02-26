import React, { useEffect, useState } from 'react';
import studentService from '../services/studentService';
import StudentLayout from '../components/StudentLayout';
import { 
    FaArrowLeft, FaBullhorn, FaCheckCircle, FaExclamationCircle, 
    FaQrcode, FaTasks, FaCloudUploadAlt, FaCamera, FaRobot, 
    FaMagic, FaCalendarAlt, FaUserEdit, FaLock, FaCheck,
    FaChevronLeft, FaChevronRight, FaCalendarDay, FaBook, FaClock, FaMapMarkerAlt, FaGraduationCap
} from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function StudentPortal() {
    const [activeTab, setActiveTab] = useState('TIMETABLE'); // Đặt Timetable làm tab mặc định để test luôn
    
    // States Core
    const [classes, setClasses] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classSubTab, setClassSubTab] = useState('GRADES'); 
    const [grades, setGrades] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [qrCodeData, setQrCodeData] = useState('');
    const [submissionUrl, setSubmissionUrl] = useState({});

    // States Combo 3 & 4
    const [availableClasses, setAvailableClasses] = useState([]);
    const [aiRecommendations, setAiRecommendations] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [curriculum, setCurriculum] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        //eslint-disable-next-line react-hooks/exhaustive-deps
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (activeTab === 'REGISTRATION') fetchRegistrationData();
        if (activeTab === 'TIMETABLE') fetchTimetableData();
        if (activeTab === 'CURRICULUM') fetchCurriculumData();
        if (activeTab === 'PROFILE') fetchProfileData();
    }, [activeTab]);

    const fetchInitialData = async () => {
        try {
            setClasses(await studentService.getMyClasses());
            setDashboardData(await studentService.getDashboard());
        } catch { console.error("Lỗi tải dữ liệu"); }
    };

    const fetchRegistrationData = async () => {
        try {
            setAvailableClasses(await studentService.getAvailableClasses());
            setAiRecommendations(await studentService.getAiRecommendations());
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu đăng ký:", error);
        }
    };

    const fetchTimetableData = async () => {
        try { setTimetable(await studentService.getTimetable()); } catch (error) { console.error("Lỗi khi tải thời khóa biểu:", error); }
    };

    const fetchCurriculumData = async () => {
        try { setCurriculum(await studentService.getCurriculum()); } catch (error) { console.error("Lỗi khi tải chương trình khung:", error); }
    };

    const fetchProfileData = async () => {
        try { setProfile(await studentService.getProfile()); } catch (error) { console.error("Lỗi khi tải hồ sơ:", error); }
    };

    const handleSelectClass = async (cls) => {
        setSelectedClass(cls);
        setClassSubTab('GRADES');
        try {
            setGrades(await studentService.getMyGrades(cls.classId));
            setAnnouncements(await studentService.getAnnouncements(cls.classId));
            setAssignments(await studentService.getClassAssignments(cls.classId));
        } catch (error) { console.error("Lỗi khi tải dữ liệu lớp:", error); }
    };

    const handleScanQR = async (e) => {
        e.preventDefault();
        if (!qrCodeData) return alert("Vui lòng nhập dữ liệu mã QR!");
        try { alert(await studentService.submitAttendanceQR(qrCodeData)); setQrCodeData(''); } catch { alert("❌ Lỗi QR!"); }
    };

    const handleSubmitAssignment = async (assignmentId) => {
        const url = submissionUrl[assignmentId];
        if (!url) return alert("Vui lòng dán Link bài làm!");
        try { alert(await studentService.submitAssignment(assignmentId, url)); setAssignments(await studentService.getClassAssignments(selectedClass.classId)); } catch { alert("❌ Lỗi!"); }
    };

    const handleEnrollClass = async (classId) => {
        try { alert(await studentService.enrollNewClass(classId)); fetchInitialData(); } catch (error) { alert("❌ Lỗi đăng ký!: " + error.message); }
    };

    // ==========================================
    // RENDER: THỜI KHÓA BIỂU (BẢN CLONE CHUẨN UTH)
    // ==========================================
    const renderTimetable = () => {
        // Hàm tìm môn học theo ngày và ca
        const getClass = (day, session) => timetable.find(t => t.dayOfWeek === day && t.session === session);

        // Render từng ô lưới
        const renderCell = (day, session) => {
            const cls = getClass(day, session);
            if (!cls) return <td style={{ border: '1px solid #dee2e6', backgroundColor: 'white', padding: '5px' }}></td>;

            return (
                <td style={{ border: '1px solid #dee2e6', backgroundColor: 'white', padding: '5px', verticalAlign: 'top' }}>
                    <div style={{ backgroundColor: '#eef2ff', borderRadius: '6px', padding: '10px', height: '100%', minHeight: '100px', display: 'flex', flexDirection: 'column', gap: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ color: '#0056b3', fontWeight: 'bold', fontSize: '13px', lineHeight: '1.4' }}>{cls.subject}</div>
                        <div style={{ color: '#333', fontSize: '12px' }}>{cls.code}</div>
                        <div style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}><FaBook size={10} color="#008080" /> Tiết: {cls.tiet}</div>
                        <div style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}><FaClock size={10} color="#008080" /> {cls.time}</div>
                        <div style={{ color: '#666', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}><FaMapMarkerAlt size={10} color="#008080" /> Phòng: {cls.room}</div>
                        <div style={{ color: '#dc3545', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'auto' }}><FaGraduationCap size={12} /> LMS</div>
                    </div>
                </td>
            );
        };

        const days = [
            { d: 2, label: 'Thứ 2', date: '02/03/2026' }, { d: 3, label: 'Thứ 3', date: '03/03/2026' }, 
            { d: 4, label: 'Thứ 4', date: '04/03/2026' }, { d: 5, label: 'Thứ 5', date: '05/03/2026' }, 
            { d: 6, label: 'Thứ 6', date: '06/03/2026' }, { d: 7, label: 'Thứ 7', date: '07/03/2026' }, 
            { d: 8, label: 'Chủ nhật', date: '08/03/2026' }
        ];

        return (
            <div style={{ animation: 'fadeIn 0.5s', backgroundColor: '#f0f2f5', minHeight: '100%' }}>
                {/* TOOLBAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ backgroundColor: 'white', border: '1px solid #008080', borderRadius: '4px', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#333' }}>
                        03/05/2026 <FaCalendarAlt color="#666" />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ backgroundColor: '#008080', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer' }}><FaChevronLeft /></button>
                        <button style={{ backgroundColor: '#008080', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCalendarDay /> HIỆN TẠI</button>
                        <button style={{ backgroundColor: '#008080', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer' }}><FaChevronRight /></button>
                    </div>
                </div>

                {/* GRID BẢNG THỜI KHÓA BIỂU */}
                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr>
                                <th colSpan="2" style={{ backgroundColor: '#008080', color: 'white', padding: '15px', border: '1px solid #006666' }}>Ca học</th>
                                {days.map((day, idx) => (
                                    <th key={idx} style={{ backgroundColor: '#008080', color: 'white', padding: '15px 5px', border: '1px solid #006666', width: '13%' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{day.label}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.9 }}>{day.date}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* KHỐI SÁNG */}
                            <tr>
                                <td rowSpan="3" style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', border: '1px solid #006666', width: '50px' }}>
                                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 'auto' }}>Sáng</div>
                                </td>
                                <td style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', padding: '10px', border: '1px solid #006666', width: '60px' }}>Ca 1</td>
                                {days.map(d => renderCell(d.d, 1))}
                            </tr>
                            <tr>
                                <td style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', padding: '10px', border: '1px solid #006666' }}>Ca 2</td>
                                {days.map(d => renderCell(d.d, 2))}
                            </tr>
                            <tr>
                                <td style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', padding: '10px', border: '1px solid #006666' }}>Ca 3</td>
                                {days.map(d => renderCell(d.d, 3))}
                            </tr>

                            {/* KHỐI CHIỀU */}
                            <tr>
                                <td rowSpan="3" style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', border: '1px solid #006666' }}>
                                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 'auto' }}>Chiều</div>
                                </td>
                                <td style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', padding: '10px', border: '1px solid #006666' }}>Ca 4</td>
                                {days.map(d => renderCell(d.d, 4))}
                            </tr>
                            <tr>
                                <td style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', padding: '10px', border: '1px solid #006666' }}>Ca 5</td>
                                {days.map(d => renderCell(d.d, 5))}
                            </tr>
                            <tr>
                                <td style={{ backgroundColor: '#008080', color: 'white', fontWeight: 'bold', padding: '10px', border: '1px solid #006666' }}>Ca 6</td>
                                {days.map(d => renderCell(d.d, 6))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ==========================================
    // CÁC HÀM RENDER CŨ CỦA BẠN (GIỮ NGUYÊN 100%)
    // ==========================================
    const renderProfile = () => {
        if (!profile) return null;
        const username = localStorage.getItem('username') || 'Sinh Viên';

        return (
            <div style={{ animation: 'fadeIn 0.5s', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#006666', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', fontWeight: 'bold', margin: '0 auto 20px auto' }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>{username}</h2>
                    <p style={{ color: '#006666', fontWeight: 'bold', margin: '0 0 15px 0' }}>{profile.major}</p>
                    <span style={{ backgroundColor: '#e9ecef', padding: '5px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Trạng thái: {profile.status}</span>
                    
                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', color: '#333' }}><FaUserEdit /> Cập nhật Avatar</button>
                        <button style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd', padding: '10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', color: '#333' }}><FaLock /> Đổi mật khẩu</button>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ color: '#006666', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Thông tin học vụ</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div><p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '13px' }}>Họ và Tên</p><p style={{ fontWeight: 'bold', margin: 0, fontSize: '16px' }}>{username}</p></div>
                        <div><p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '13px' }}>Mã Sinh Viên (MSSV)</p><p style={{ fontWeight: 'bold', margin: 0, fontSize: '16px' }}>SV_{username}</p></div>
                        <div><p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '13px' }}>Khóa học</p><p style={{ fontWeight: 'bold', margin: 0, fontSize: '16px' }}>{profile.batch}</p></div>
                        <div><p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '13px' }}>Chuyên ngành</p><p style={{ fontWeight: 'bold', margin: 0, fontSize: '16px' }}>{profile.major}</p></div>
                        <div><p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '13px' }}>Email trường</p><p style={{ fontWeight: 'bold', margin: 0, fontSize: '16px' }}>{profile.email}</p></div>
                        <div><p style={{ color: '#888', margin: '0 0 5px 0', fontSize: '13px' }}>Số điện thoại</p><p style={{ fontWeight: 'bold', margin: 0, fontSize: '16px' }}>{profile.phone}</p></div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCurriculum = () => (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <h2 style={{ color: '#006666', marginTop: 0 }}>Chương trình Đào tạo Toàn khóa</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>Theo dõi tiến độ hoàn thành các môn học theo từng học kỳ.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {curriculum.map((sem, i) => (
                    <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#ffc107', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{sem.semester}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ color: '#888', fontSize: '14px', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '10px' }}>Tên môn học</th><th style={{ padding: '10px', textAlign: 'center' }}>Tín chỉ</th><th style={{ padding: '10px', textAlign: 'center' }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sem.subjects.map((sub, j) => (
                                    <tr key={j} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                        <td style={{ padding: '15px', fontWeight: '500' }}>{sub.name}</td><td style={{ padding: '15px', textAlign: 'center' }}>{sub.credits}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {sub.status === 'PASSED' && <span style={{ color: '#28a745', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><FaCheck /> Đã qua</span>}
                                            {sub.status === 'STUDYING' && <span style={{ color: '#006666', fontWeight: 'bold' }}>Đang học</span>}
                                            {sub.status === 'NOT_STARTED' && <span style={{ color: '#888' }}>Chưa học</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDashboard = () => { 
        if (!dashboardData) return null;
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', animation: 'fadeIn 0.5s' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '5px solid #006666' }}>
                        <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Điểm Trung Bình (GPA)</h4>
                        <h1 style={{ color: '#006666', margin: 0, fontSize: '48px' }}>{dashboardData.gpa}</h1>
                        <p style={{ color: '#28a745', margin: '10px 0 0 0', fontWeight: 'bold' }}>Xếp loại: Khá</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '5px solid #ffc107' }}>
                        <h4 style={{ color: '#666', margin: '0 0 10px 0' }}>Tín chỉ tích lũy</h4>
                        <h1 style={{ color: '#ffc107', margin: 0, fontSize: '48px' }}>{dashboardData.credits}</h1>
                        <p style={{ color: '#888', margin: '10px 0 0 0' }}>/ 120 tín chỉ yêu cầu</p>
                    </div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ textAlign: 'center', color: '#006666', margin: '0 0 20px 0' }}>Bản đồ Năng lực Học tập</h3>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dashboardData.radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Năng lực" dataKey="A" stroke="#006666" fill="#006666" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderRegistration = () => (
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ background: 'linear-gradient(135deg, #006666 0%, #1A237E 100%)', borderRadius: '12px', padding: '25px', color: 'white', marginBottom: '30px', boxShadow: '0 5px 15px rgba(0, 102, 102, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '50%' }}><FaRobot size={30} /></div>
                    <div>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>AI Advisor <FaMagic color="#ffc107" size={20} /></h2>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Hệ thống phân tích lịch sử học tập và gợi ý lộ trình tối ưu nhất cho bạn.</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {aiRecommendations.map((ai, index) => (
                        <div key={index} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px', borderLeft: `5px solid ${ai.type === 'BẮT BUỘC' ? '#ffc107' : '#28a745'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ backgroundColor: ai.type === 'BẮT BUỘC' ? '#ffc107' : '#28a745', color: ai.type === 'BẮT BUỘC' ? '#333' : 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{ai.type}</span>
                                <span style={{ fontWeight: 'bold', color: '#00ffcc' }}>Độ phù hợp: {ai.match}%</span>
                            </div>
                            <h3 style={{ margin: '0 0 10px 0' }}>{ai.name} ({ai.code})</h3>
                            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, fontStyle: 'italic' }}>"{ai.reason}"</p>
                        </div>
                    ))}
                </div>
            </div>

            <h3 style={{ color: '#006666', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Các lớp học đang mở đăng ký</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <thead style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                    <tr>
                        <th style={{ padding: '15px' }}>Mã - Tên môn</th><th style={{ padding: '15px', textAlign: 'center' }}>Số TC</th><th style={{ padding: '15px' }}>Lịch học</th><th style={{ padding: '15px' }}>Điều kiện Tiên quyết</th><th style={{ padding: '15px', textAlign: 'center' }}>Sĩ số</th><th style={{ padding: '15px', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {availableClasses.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '15px' }}><strong>{c.code}</strong><br/>{c.name}</td>
                            <td style={{ padding: '15px', textAlign: 'center' }}><span style={{ backgroundColor: '#e9ecef', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold' }}>{c.credits}</span></td>
                            <td style={{ padding: '15px', color: '#006666', fontWeight: '500' }}><FaCalendarAlt /> {c.schedule}</td>
                            <td style={{ padding: '15px', color: c.prerequisite !== 'Không' ? '#dc3545' : '#28a745' }}>{c.prerequisite}</td>
                            <td style={{ padding: '15px', textAlign: 'center', color: c.status === 'FULL' ? 'red' : 'inherit' }}>{c.status === 'FULL' ? 'Đã đầy' : `Còn ${c.remaining} chỗ`}</td>
                            <td style={{ padding: '15px', textAlign: 'center' }}><button onClick={() => handleEnrollClass(c.id)} style={{ backgroundColor: c.status === 'FULL' ? '#ffc107' : '#006666', color: c.status === 'FULL' ? '#333' : 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{c.status === 'FULL' ? 'Vào Waitlist' : 'Đăng ký'}</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderClassDetail = () => {
        if (!selectedClass) return null;
        let totalScore = null;
        if (grades && grades.processScore !== null && grades.finalScore !== null) totalScore = (grades.processScore * 0.4 + grades.finalScore * 0.6).toFixed(1);

        return (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '25px', animation: 'fadeIn 0.3s' }}>
                <button onClick={() => setSelectedClass(null)} style={{ background: 'none', border: 'none', color: '#006666', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0, marginBottom: '20px', fontWeight: 'bold' }}>
                    <FaArrowLeft /> Trở về danh sách lớp
                </button>
                <h2 style={{ margin: '0 0 5px 0', color: '#006666' }}>{selectedClass.subjectName}</h2>
                <p style={{ color: '#666', margin: '0 0 20px 0' }}>Mã lớp: <strong>{selectedClass.classCode}</strong> | Giảng viên: <strong>{selectedClass.lecturerName}</strong></p>

                <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #eee', marginBottom: '20px', overflowX: 'auto' }}>
                    <div onClick={() => setClassSubTab('GRADES')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'GRADES' ? '3px solid #006666' : '3px solid transparent', color: classSubTab === 'GRADES' ? '#006666' : '#666', whiteSpace: 'nowrap' }}>Bảng điểm</div>
                    <div onClick={() => setClassSubTab('ATTENDANCE')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ATTENDANCE' ? '3px solid #6f42c1' : '3px solid transparent', color: classSubTab === 'ATTENDANCE' ? '#6f42c1' : '#666', whiteSpace: 'nowrap' }}><FaQrcode /> Điểm danh QR</div>
                    <div onClick={() => setClassSubTab('ASSIGNMENTS')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ASSIGNMENTS' ? '3px solid #28a745' : '3px solid transparent', color: classSubTab === 'ASSIGNMENTS' ? '#28a745' : '#666', whiteSpace: 'nowrap' }}><FaTasks /> Bài tập</div>
                    <div onClick={() => setClassSubTab('ANNOUNCEMENTS')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ANNOUNCEMENTS' ? '3px solid #ffc107' : '3px solid transparent', color: classSubTab === 'ANNOUNCEMENTS' ? '#ffc107' : '#666', whiteSpace: 'nowrap' }}><FaBullhorn /> Thông báo</div>
                </div>

                {classSubTab === 'GRADES' && (
                    <div style={{ maxWidth: '700px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #ddd' }}>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #ddd' }}><th style={{ padding: '15px', backgroundColor: '#f8f9fa', width: '60%' }}>Điểm Quá trình (40%)</th><td style={{ padding: '15px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: '#006666' }}>{grades?.processScore ?? '-'}</td></tr>
                                <tr style={{ borderBottom: '1px solid #ddd' }}><th style={{ padding: '15px', backgroundColor: '#f8f9fa' }}>Điểm Thi cuối kỳ (60%)</th><td style={{ padding: '15px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: '#006666' }}>{grades?.finalScore ?? '-'}</td></tr>
                                <tr style={{ backgroundColor: '#006666', color: 'white' }}><th style={{ padding: '15px', fontSize: '18px' }}>TỔNG KẾT HỌC PHẦN</th><td style={{ padding: '15px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: totalScore >= 4 ? '#ffc107' : (totalScore === null ? 'white' : '#ffc107') }}>{totalScore ?? 'Chưa tổng kết'}</td></tr>
                            </tbody>
                        </table>
                    </div>
                )}
                {classSubTab === 'ATTENDANCE' && (
                    <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px dashed #ccc' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e0cffc', color: '#6f42c1', marginBottom: '20px' }}><FaCamera size={40} /></div>
                        <h3 style={{ color: '#333' }}>Quét mã QR Điểm danh</h3>
                        <form onSubmit={handleScanQR} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <input type="text" placeholder="Dán mã QR (ví dụ: SEP_ATTENDANCE_...)" value={qrCodeData} onChange={e => setQrCodeData(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', width: '350px' }} />
                            <button type="submit" style={{ backgroundColor: '#6f42c1', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Ghi nhận</button>
                        </form>
                    </div>
                )}
                {classSubTab === 'ASSIGNMENTS' && (
                    <div>
                        {assignments.map(a => (
                            <div key={a.id} style={{ backgroundColor: 'white', border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: a.status === 'SUBMITTED' ? '5px solid #28a745' : '5px solid #dc3545', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div><h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{a.title}</h3><p style={{ margin: 0, color: '#555', fontSize: '14px' }}>{a.description}</p></div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ display: 'inline-block', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', backgroundColor: a.status === 'SUBMITTED' ? '#d4edda' : '#f8d7da', color: a.status === 'SUBMITTED' ? '#155724' : '#721c24', marginBottom: '5px' }}>{a.status === 'SUBMITTED' ? 'Đã nộp bài' : 'Chưa nộp'}</span>
                                        <div style={{ fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>Hạn chót: {new Date(a.deadline).toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                                {a.status !== 'SUBMITTED' && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px dashed #eee' }}>
                                        <input type="text" placeholder="Dán Link Google Drive / Github bài làm..." value={submissionUrl[a.id] || ''} onChange={e => setSubmissionUrl({...submissionUrl, [a.id]: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                        <button onClick={() => handleSubmitAssignment(a.id)} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FaCloudUploadAlt /> Nộp Bài</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {classSubTab === 'ANNOUNCEMENTS' && (
                    <div>
                        {announcements.map(a => (
                            <div key={a.id} style={{ backgroundColor: '#f8f9fa', border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #ffc107' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{a.title}</h3><p style={{ margin: '15px 0 0 0', color: '#444', fontSize: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{a.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <StudentLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'PROFILE' && renderProfile()}
            {activeTab === 'DASHBOARD' && renderDashboard()}
            {activeTab === 'REGISTRATION' && renderRegistration()}
            {activeTab === 'TIMETABLE' && renderTimetable()}
            {activeTab === 'CURRICULUM' && renderCurriculum()}
            
            {activeTab === 'GRADES' && (selectedClass ? renderClassDetail() : 
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.5s' }}>
                    {classes.length === 0 ? <p>Bạn chưa được đăng ký vào lớp học nào.</p> : classes.map(c => (
                        <div key={c.classId} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', borderTop: '5px solid #006666' }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#006666' }}>{c.subjectName}</h3>
                            <span style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>Mã lớp: {c.classCode}</span>
                            <p style={{ margin: '0 0 20px 0', color: '#444', fontSize: '14px' }}>Giảng viên: <strong>{c.lecturerName}</strong></p>
                            <button onClick={() => handleSelectClass(c)} style={{ marginTop: 'auto', backgroundColor: '#ffc107', color: '#333', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: '0.2s' }}>
                                Vào Lớp Học
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </StudentLayout>
    );
}