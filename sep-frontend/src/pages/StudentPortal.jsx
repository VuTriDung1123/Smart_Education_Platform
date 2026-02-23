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

    const fetchData = async () => {
        try {
            const classData = await studentService.getAllClassrooms();
            setClassrooms(classData);

            try {
                const loggedInUsername = localStorage.getItem('username');
                const users = await userService.getAllUsers();
                const me = users.find(u => u.username === loggedInUsername);
                if (me) setCurrentUserId(me.id);
            } catch (err) { console.warn("Lỗi phân quyền khi lấy User ID"); }

            setLoading(false);
        } catch (error) {
            console.error("Lỗi:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Logic Đăng ký & Hủy
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

    // Dữ liệu an toàn
    const safeClasses = classrooms.map(c => ({ ...c, enrolledStudentIds: c.enrolledStudentIds || [], credits: c.credits || 3 }));
    const myClasses = safeClasses.filter(c => c.enrolledStudentIds.includes(currentUserId));
    const totalCredits = myClasses.reduce((sum, c) => sum + c.credits, 0);

    // ==========================================
    // RENDER CÁC TAB CHỨC NĂNG
    // ==========================================

    const renderDashboard = () => (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
            {/* Khối Thông tin Sinh viên */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#006666', borderBottom: '2px solid #006666', paddingBottom: '10px', marginTop: 0 }}><FaRegIdCard /> Thông tin sinh viên</h3>
                <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                    <div style={{ width: '120px', height: '160px', backgroundColor: '#e9ecef', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc' }}>
                        <FaUserCircle size={80} color="#adb5bd" />
                    </div>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '15px', color: '#444' }}>
                        <p><strong>MSSV:</strong> 022205001700</p>
                        <p><strong>Khóa học:</strong> 2023</p>
                        <p><strong>Họ tên:</strong> {localStorage.getItem('fullName') || 'Vũ Trí Dũng'}</p>
                        <p><strong>Giới tính:</strong> Nam</p>
                        <p><strong>Ngày sinh:</strong> 23/11/2005</p>
                        <p><strong>Bậc đào tạo:</strong> Đại học - CQ</p>
                        <p><strong>Nơi sinh:</strong> Quảng Ninh</p>
                        <p><strong>Chuyên ngành:</strong> CN Phần mềm</p>
                    </div>
                </div>
            </div>

            {/* Khối Tiến độ học tập (Biểu đồ tròn) */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ color: '#006666', width: '100%', borderBottom: '2px solid #006666', paddingBottom: '10px', marginTop: 0, textAlign: 'center' }}><FaChartBar /> Tiến độ học tập</h3>
                
                {/* Biểu đồ CSS thuẩn */}
                <div style={{ marginTop: '20px', width: '160px', height: '160px', borderRadius: '50%', background: `conic-gradient(#0dcaf0 ${((75 + totalCredits)/120) * 360}deg, #e9ecef 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '120px', height: '120px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '22px', color: '#333' }}>{75 + totalCredits}/120</span>
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Tín chỉ</span>
                    </div>
                </div>
                <p style={{ marginTop: '20px', color: '#555', fontWeight: '500' }}>Học kỳ 2 năm học 2025-2026</p>
            </div>
        </div>
    );

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
                <p style={{ color: '#dc3545', fontStyle: 'italic' }}>Bạn chưa đăng ký môn học nào nên chưa có lịch học.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(6, 1fr)', gap: '1px', backgroundColor: '#dee2e6', border: '1px solid #dee2e6' }}>
                    {/* Header ngày */}
                    <div style={{ backgroundColor: '#00796b', color: 'white', padding: '15px 5px', textAlign: 'center', fontWeight: 'bold' }}>Ca học</div>
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map(d => (
                        <div key={d} style={{ backgroundColor: '#00796b', color: 'white', padding: '15px 5px', textAlign: 'center', fontWeight: 'bold' }}>{d}</div>
                    ))}
                    
                    {/* Hàng mô phỏng Ca Sáng */}
                    <div style={{ backgroundColor: '#f8f9fa', padding: '20px 5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#006666' }}>Sáng</div>
                    {/* Rải môn học ngẫu nhiên vào các ô */}
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((d, index) => {
                        const classForThisDay = myClasses[index % myClasses.length];
                        return (
                            <div key={`sang-${d}`} style={{ backgroundColor: 'white', padding: '10px', fontSize: '13px' }}>
                                {index % 2 === 0 && classForThisDay ? (
                                    <div style={{ backgroundColor: '#e0f2f1', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #006666' }}>
                                        <strong style={{ color: '#006666', display: 'block', marginBottom: '5px' }}>{classForThisDay.subject}</strong>
                                        <div style={{ color: '#555' }}>Mã: {classForThisDay.classCode}</div>
                                        <div style={{ color: '#555' }}>Phòng: ONLINE</div>
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}

                    {/* Hàng mô phỏng Ca Chiều */}
                    <div style={{ backgroundColor: '#f8f9fa', padding: '20px 5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#006666' }}>Chiều</div>
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((d, index) => {
                        const classForThisDay = myClasses[(index + 1) % myClasses.length];
                        return (
                            <div key={`chieu-${d}`} style={{ backgroundColor: 'white', padding: '10px', fontSize: '13px' }}>
                                {index % 2 !== 0 && classForThisDay ? (
                                    <div style={{ backgroundColor: '#eef2ff', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #3f51b5' }}>
                                        <strong style={{ color: '#3f51b5', display: 'block', marginBottom: '5px' }}>{classForThisDay.subject}</strong>
                                        <div style={{ color: '#555' }}>Mã: {classForThisDay.classCode}</div>
                                        <div style={{ color: '#555' }}>Phòng: LAB-102</div>
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );

    const renderGrades = () => (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#006666', marginTop: 0 }}><FaListOl /> Bảng điểm học tập</h3>
            <p style={{ color: '#666' }}>Dữ liệu hiển thị mang tính chất minh họa chức năng.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', marginTop: '15px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#00796b', color: 'white' }}>
                        <th style={{ padding: '12px' }}>Môn học</th>
                        <th style={{ padding: '12px' }}>Tín chỉ</th>
                        <th style={{ padding: '12px' }}>Điểm quá trình</th>
                        <th style={{ padding: '12px' }}>Điểm thi</th>
                        <th style={{ padding: '12px' }}>Tổng kết (10)</th>
                        <th style={{ padding: '12px' }}>Điểm chữ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <td colSpan="6" style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#d9363e' }}>Học kỳ 1 năm học 2024-2025</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', textAlign: 'left' }}>Nhập môn ngành CNTT</td>
                        <td>3</td><td>8.5</td><td>9.0</td><td style={{fontWeight: 'bold'}}>8.8</td><td style={{fontWeight: 'bold', color: '#28a745'}}>A</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', textAlign: 'left' }}>Giải tích 1</td>
                        <td>3</td><td>7.0</td><td>6.5</td><td style={{fontWeight: 'bold'}}>6.7</td><td style={{fontWeight: 'bold', color: '#fd7e14'}}>B</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

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