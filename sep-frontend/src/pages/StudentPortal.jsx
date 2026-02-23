import React, { useEffect, useState } from 'react';
import studentService from '../services/studentService';
import userService from '../services/userService';
import StudentLayout from '../components/StudentLayout';
import { FaCheckCircle, FaTimesCircle, FaBan, FaRegIdCard, FaBook, FaListOl, FaUserCircle, FaChartBar, FaCalendarAlt } from 'react-icons/fa';

export default function StudentPortal() {
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    
    // Data States
    const [classrooms, setClassrooms] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [portalData, setPortalData] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        studentCode: '', gender: '', dateOfBirth: '', placeOfBirth: '', major: 'Công nghệ thông tin', batch: '2023'
    });

    // DUY NHẤT 1 HÀM fetchData ĐÃ ĐƯỢC GỘP CHUẨN CHỈ
    const fetchData = async () => {
        try {
            // 1. Tải danh sách lớp học
            const classData = await studentService.getAllClassrooms();
            setClassrooms(classData);

            // 2. Lấy thông tin cá nhân và bảng điểm
            try {
                const loggedInUsername = localStorage.getItem('username');
                const users = await userService.getAllUsers();
                const me = users.find(u => u.username === loggedInUsername);
                
                if (me) {
                    setCurrentUserId(me.id);
                    // Gọi API lấy Profile và Điểm
                    const data = await studentService.getMyPortalData(me.id);
                    setPortalData(data);
                    
                    // Nạp dữ liệu vào Form sửa
                    setProfileForm({
                        studentCode: data.profile.studentCode === 'Chưa cập nhật' ? '' : data.profile.studentCode,
                        gender: data.profile.gender || 'Nam',
                        dateOfBirth: data.profile.dateOfBirth === '01/01/2000' ? '' : data.profile.dateOfBirth,
                        placeOfBirth: data.profile.placeOfBirth === 'Chưa cập nhật' ? '' : data.profile.placeOfBirth,
                        major: data.profile.major || 'Công nghệ thông tin',
                        batch: data.profile.batch || '2023'
                    });
                }
            } catch (err) {
                console.warn("Lỗi phân quyền khi lấy thông tin User", err);
            }

            setLoading(false);
        } catch (error) {
            console.error("Lỗi:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    // Logic Đăng ký & Hủy lớp học
    const handleEnroll = async (classId) => {
        if (!currentUserId) return alert("Chưa lấy được ID sinh viên!");
        try {
            await studentService.enrollClass(classId, currentUserId);
            alert("✅ Đăng ký thành công!");
            fetchData();
        } catch (error) { alert("❌ Lỗi: " + (error.response?.data || error.message)); }
    };

    const handleDrop = async (classId) => {
        if (!window.confirm("Hủy đăng ký lớp này?")) return;
        try {
            await studentService.dropClass(classId, currentUserId);
            alert("✅ Đã hủy!");
            fetchData();
        } catch (error) { alert("❌ Lỗi: " + error.message); }
    };

    // Logic Cập nhật Hồ sơ
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await studentService.updateProfile(currentUserId, profileForm);
            alert("✅ Đã cập nhật hồ sơ thành công!");
            setIsEditingProfile(false);
            fetchData(); // Load lại dữ liệu mới nhất
        } catch (error) {
            alert("❌ Lỗi khi cập nhật: " + error.message);
        }
    };

    // Tính toán dữ liệu an toàn
    const safeClasses = classrooms.map(c => ({ ...c, enrolledStudentIds: c.enrolledStudentIds || [], credits: c.credits || 3 }));
    const myClasses = safeClasses.filter(c => c.enrolledStudentIds.includes(currentUserId));
    const totalCredits = myClasses.reduce((sum, c) => sum + c.credits, 0);

    // ==========================================
    // RENDER CÁC TAB CHỨC NĂNG
    // ==========================================

    const renderDashboard = () => {
        if (!portalData) return <p>Đang tải thông tin cá nhân...</p>;
        const profile = portalData.profile;
        
        // 🔥 LOGIC CHUẨN: Chỉ cộng tín chỉ của những môn có điểm ĐẠT
        const earnedCredits = (portalData.grades || [])
            .filter(g => g.status === 'Đạt')
            .reduce((sum, g) => sum + g.credits, 0);

        const totalRequired = 120; // Tổng tín chỉ yêu cầu của ngành
        const percentage = (earnedCredits / totalRequired) * 360;

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
                {/* Khối Profile giữ nguyên */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #006666', paddingBottom: '10px' }}>
                        <h3 style={{ color: '#006666', margin: 0 }}><FaRegIdCard /> Thông tin sinh viên</h3>
                        <button onClick={() => setIsEditingProfile(true)} style={{ backgroundColor: '#006666', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sửa hồ sơ</button>
                    </div>
                    <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                        <div style={{ width: '120px', height: '160px', backgroundColor: '#e9ecef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc' }}>
                            <FaUserCircle size={80} color="#adb5bd" />
                        </div>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '15px', color: '#444' }}>
                            <p><strong>MSSV:</strong> <span style={{color: profile.studentCode === 'Chưa cập nhật' ? 'red' : 'black'}}>{profile.studentCode}</span></p>
                            <p><strong>Khóa học:</strong> {profile.batch}</p>
                            <p><strong>Họ tên:</strong> {profile.fullName}</p>
                            <p><strong>Giới tính:</strong> {profile.gender}</p>
                            <p><strong>Ngày sinh:</strong> {profile.dateOfBirth}</p>
                            <p><strong>Bậc đào tạo:</strong> Đại học - CQ</p>
                            <p><strong>Nơi sinh:</strong> {profile.placeOfBirth}</p>
                            <p><strong>Chuyên ngành:</strong> {profile.major}</p>
                        </div>
                    </div>
                </div>

                {/* Khối Tiến độ học tập */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ color: '#006666', width: '100%', borderBottom: '2px solid #006666', paddingBottom: '10px', marginTop: 0, textAlign: 'center' }}><FaChartBar /> Tiến độ học tập</h3>
                    
                    {/* Vòng tròn tính toán dựa trên số liệu THẬT */}
                    <div style={{ marginTop: '20px', width: '160px', height: '160px', borderRadius: '50%', background: `conic-gradient(#0dcaf0 ${percentage}deg, #e9ecef 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: '120px', height: '120px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '22px', color: '#333' }}>{earnedCredits}/{totalRequired}</span>
                            <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Tín chỉ</span>
                        </div>
                    </div>
                    <p style={{ marginTop: '20px', color: '#555', fontWeight: '500', fontSize: '14px', textAlign: 'center' }}>
                        Dữ liệu dựa trên số tín chỉ tích lũy (Các môn đã có điểm & đạt)
                    </p>
                </div>

                {/* MODAL CẬP NHẬT HỒ SƠ */}
                {isEditingProfile && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            <h3 style={{ marginTop: 0, color: '#006666' }}>Cập nhật Hồ sơ Sinh viên</h3>
                            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Mã số SV (MSSV)</label>
                                        <input type="text" value={profileForm.studentCode} onChange={e => setProfileForm({...profileForm, studentCode: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Khóa học</label>
                                        <input type="text" value={profileForm.batch} onChange={e => setProfileForm({...profileForm, batch: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Ngày sinh (DD/MM/YYYY)</label>
                                        <input type="text" value={profileForm.dateOfBirth} onChange={e => setProfileForm({...profileForm, dateOfBirth: e.target.value})} placeholder="VD: 23/11/2005" required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Giới tính</label>
                                        <select value={profileForm.gender} onChange={e => setProfileForm({...profileForm, gender: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Nơi sinh</label>
                                    <input type="text" value={profileForm.placeOfBirth} onChange={e => setProfileForm({...profileForm, placeOfBirth: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Chuyên ngành</label>
                                    <input type="text" value={profileForm.major} onChange={e => setProfileForm({...profileForm, major: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={{ flex: 1, backgroundColor: '#006666', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Lưu thay đổi</button>
                                    <button type="button" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, backgroundColor: '#e9ecef', color: '#333', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy bỏ</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderRegistration = () => (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#006666' }}>Danh sách Lớp học phần đang mở</h3>
                <span style={{ fontWeight: 'bold', color: '#d9363e' }}>Bạn đã đăng ký: {totalCredits} TC</span>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#00796b', color: 'white' }}>
                        <th style={{ padding: '15px' }}>Mã Lớp</th>
                        <th style={{ padding: '15px' }}>Môn học</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>TC</th>
                        <th style={{ padding: '15px' }}>Giảng viên</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Sĩ số</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {safeClasses.map((cls) => {
                        const isEnrolled = cls.enrolledStudentIds.includes(currentUserId);
                        const isFull = cls.studentCount >= 10;
                        return (
                            <tr key={cls.id} style={{ borderBottom: '1px solid #eee', backgroundColor: isEnrolled ? '#e0f2f1' : 'white' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold', color: '#006666' }}>{cls.classCode}</td>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{cls.subject}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{cls.credits}</td>
                                <td style={{ padding: '15px', color: '#555' }}>{cls.lecturer}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <span style={{ backgroundColor: isFull ? '#f8d7da' : '#e2e3e5', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>{cls.studentCount} / 10</span>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {isEnrolled ? (
                                        <button onClick={() => handleDrop(cls.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}><FaTimesCircle /> Hủy</button>
                                    ) : isFull ? (
                                        <button disabled style={{ backgroundColor: '#e9ecef', color: '#6c757d', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' }}><FaBan /> Đầy</button>
                                    ) : (
                                        <button onClick={() => handleEnroll(cls.id)} style={{ backgroundColor: '#006666', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}><FaCheckCircle /> Đăng ký</button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const renderTimetable = () => (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#006666', marginTop: 0 }}><FaCalendarAlt /> Thời khóa biểu tuần này</h3>
            
            {myClasses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <p style={{ color: '#777', fontSize: '16px', margin: 0 }}>Bạn chưa đăng ký lớp học phần nào.</p>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <FaCalendarAlt size={40} color="#adb5bd" style={{ marginBottom: '15px' }} />
                    <h4 style={{ color: '#555', margin: '0 0 10px 0' }}>Hệ thống chưa cập nhật lịch học cụ thể</h4>
                    <p style={{ color: '#777', margin: 0, fontSize: '14px' }}>
                        Các lớp học phần bạn đã đăng ký hiện chưa có dữ liệu về thời gian (Thứ/Ca) và Phòng học từ Phòng Đào Tạo. Vui lòng theo dõi lại sau!
                    </p>
                    
                    <div style={{ marginTop: '20px', textAlign: 'left', display: 'inline-block', backgroundColor: 'white', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#006666' }}>Danh sách lớp chờ xếp lịch:</h5>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#444' }}>
                            {myClasses.map(c => (
                                <li key={c.id} style={{ marginBottom: '5px' }}>
                                    <strong>{c.classCode}</strong> - {c.subject}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );

    const renderGrades = () => {
        if (!portalData) return <p>Đang tải thông tin...</p>;
        const grades = portalData.grades || [];

        return (
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#006666', marginTop: 0 }}><FaListOl /> Bảng điểm học tập</h3>
                
                {grades.length === 0 ? (
                    // 🌟 Giao diện khi CHƯA CÓ ĐIỂM
                    <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc', marginTop: '15px' }}>
                        <FaListOl size={40} color="#adb5bd" style={{ marginBottom: '15px' }} />
                        <h4 style={{ color: '#555', margin: '0 0 5px 0' }}>Chưa có dữ liệu điểm</h4>
                        <p style={{ color: '#777', fontSize: '14px', margin: 0 }}>Hệ thống chưa ghi nhận kết quả học tập nào của bạn.</p>
                    </div>
                ) : (
                    // 🌟 Giao diện khi ĐÃ CÓ ĐIỂM
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#00796b', color: 'white' }}>
                                <th style={{ padding: '12px' }}>Mã HP</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Tên học phần</th>
                                <th style={{ padding: '12px' }}>Tín chỉ</th>
                                <th style={{ padding: '12px' }}>Học kỳ</th>
                                <th style={{ padding: '12px' }}>Quá trình</th>
                                <th style={{ padding: '12px' }}>Thi</th>
                                <th style={{ padding: '12px' }}>Tổng kết</th>
                                <th style={{ padding: '12px' }}>Điểm chữ</th>
                                <th style={{ padding: '12px' }}>Đạt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((g, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#006666' }}>{g.subjectCode}</td>
                                    <td style={{ padding: '12px', textAlign: 'left', fontWeight: '500' }}>{g.subjectName}</td>
                                    <td>{g.credits}</td>
                                    <td style={{ fontStyle: 'italic', fontSize: '13px', color: '#666' }}>{g.semester}</td>
                                    <td>{g.processScore !== null ? g.processScore : '-'}</td>
                                    <td>{g.finalScore !== null ? g.finalScore : '-'}</td>
                                    <td style={{fontWeight: 'bold'}}>{g.totalScore !== null ? g.totalScore : '-'}</td>
                                    <td style={{fontWeight: 'bold', color: g.letterGrade === 'F' ? '#dc3545' : '#28a745'}}>{g.letterGrade || '-'}</td>
                                    <td>
                                        {g.status === 'Đạt' ? (
                                            <FaCheckCircle color="#28a745" title="Đạt" size={18} />
                                        ) : (
                                            <FaTimesCircle color="#dc3545" title="Học lại" size={18} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    return (
        <StudentLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {loading ? <p style={{textAlign: 'center', marginTop: '50px'}}>Đang tải dữ liệu, vui lòng chờ...</p> : (
                <div style={{ animation: 'fadeIn 0.5s' }}>
                    {activeTab === 'DASHBOARD' && renderDashboard()}
                    {activeTab === 'REGISTRATION' && renderRegistration()}
                    {activeTab === 'TIMETABLE' && renderTimetable()}
                    {activeTab === 'GRADES' && renderGrades()}
                    {activeTab === 'CURRICULUM' && (
                        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px' }}>
                            <FaBook size={60} color="#ccc" />
                            <h2 style={{ color: '#666' }}>Chương trình đào tạo</h2>
                            <p>Tính năng đang được phát triển. Dữ liệu sẽ được cập nhật sớm.</p>
                        </div>
                    )}
                </div>
            )}
        </StudentLayout>
    );
}