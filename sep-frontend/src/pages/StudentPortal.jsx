import React, { useEffect, useState } from 'react';
import studentService from '../services/studentService';
import userService from '../services/userService';
import StudentLayout from '../components/StudentLayout';
import { FaCheckCircle, FaTimesCircle, FaBan } from 'react-icons/fa';

export default function StudentPortal() {
    const [classrooms, setClassrooms] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    const fetchData = async () => {
        try {
            // Bước 1: Tải danh sách lớp học trước (luôn luôn load)
            const classData = await studentService.getAllClassrooms();
            setClassrooms(classData);

            // Bước 2: Tải thông tin cá nhân (Tách riêng để nếu lỗi không bị sập trang)
            try {
                const loggedInUsername = localStorage.getItem('username');
                const users = await userService.getAllUsers();
                const me = users.find(u => u.username === loggedInUsername);
                if (me) {
                    setCurrentUserId(me.id);
                }
            } catch (userErr) {
                console.warn("⚠️ API chặn quyền xem User. Đang tìm ID qua cách khác...");
                // Dành cho thực tế: Lúc Login nên lưu luôn ID vào localStorage
                // localStorage.setItem('userId', data.id);
            }

            setLoading(false);
        } catch (error) {
            console.error("❌ Lỗi tải dữ liệu lớp học:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEnroll = async (classId) => {
        if (!currentUserId) return alert("❌ Lỗi: Hệ thống chưa lấy được ID của bạn. Vui lòng báo Admin cấp quyền xem Profile!");
        try {
            await studentService.enrollClass(classId, currentUserId);
            alert("✅ Đăng ký học phần thành công!");
            fetchData();
        } catch (error) {
            alert("❌ Không thể đăng ký: " + (error.response?.data || error.message));
        }
    };

    const handleDrop = async (classId) => {
        if (!window.confirm("⚠️ Bạn có chắc chắn muốn HỦY lớp học này không?")) return;
        try {
            await studentService.dropClass(classId, currentUserId);
            alert("✅ Đã hủy đăng ký!");
            fetchData();
        } catch (error) {
            alert("❌ Lỗi: " + error.message);
        }
    };

    // LOGIC AN TOÀN: Đảm bảo enrolledStudentIds và credits luôn tồn tại dù Backend trả thiếu
    const safeClassrooms = classrooms.map(c => ({
        ...c,
        enrolledStudentIds: c.enrolledStudentIds || [],
        credits: c.credits || 0
    }));

    // Lọc danh sách theo Tab
    const displayClasses = activeTab === 'ALL' 
        ? safeClassrooms 
        : safeClassrooms.filter(c => c.enrolledStudentIds.includes(currentUserId));

    // Tính tổng số tín chỉ đã đăng ký
    const totalEnrolledCredits = safeClassrooms
        .filter(c => c.enrolledStudentIds.includes(currentUserId))
        .reduce((sum, current) => sum + current.credits, 0);

    return (
        <StudentLayout>
            {/* THỐNG KÊ NHANH */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                <div style={{ background: 'linear-gradient(135deg, #198754, #146c43)', padding: '20px', borderRadius: '12px', color: 'white', flex: 1, boxShadow: '0 4px 15px rgba(25,135,84,0.3)' }}>
                    <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Tổng Tín Chỉ Đã Đăng Ký</h4>
                    <h2 style={{ margin: 0, fontSize: '32px' }}>{totalEnrolledCredits} <span style={{fontSize: '16px', fontWeight: 'normal'}}>tín chỉ</span></h2>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #ffc107, #d39e00)', padding: '20px', borderRadius: '12px', color: '#333', flex: 1, boxShadow: '0 4px 15px rgba(255,193,7,0.3)' }}>
                    <h4 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>Số Môn Đã Đăng Ký</h4>
                    <h2 style={{ margin: 0, fontSize: '32px' }}>{displayClasses.filter(c => c.enrolledStudentIds.includes(currentUserId)).length} <span style={{fontSize: '16px', fontWeight: 'normal'}}>môn học</span></h2>
                </div>
            </div>

            {/* TAB CHUYỂN ĐỔI */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('ALL')}
                    style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeTab === 'ALL' ? '#198754' : '#e9ecef', color: activeTab === 'ALL' ? 'white' : '#495057', transition: '0.2s' }}>
                    🛒 Danh Sách Lớp Đang Mở
                </button>
                <button 
                    onClick={() => setActiveTab('MY_CLASSES')}
                    style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeTab === 'MY_CLASSES' ? '#198754' : '#e9ecef', color: activeTab === 'MY_CLASSES' ? 'white' : '#495057', transition: '0.2s' }}>
                    🎒 Lớp Học Của Tôi
                </button>
            </div>

            {/* BẢNG LỚP HỌC */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {loading ? <p style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold', color: '#198754' }}>Đang tải dữ liệu, vui lòng chờ...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#198754', color: 'white' }}>
                                <th style={{ padding: '15px' }}>Mã Lớp</th>
                                <th style={{ padding: '15px' }}>Môn học</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Tín chỉ</th>
                                <th style={{ padding: '15px' }}>Giảng viên</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Sĩ số</th>
                                <th style={{ padding: '15px', textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayClasses.length > 0 ? displayClasses.map((cls) => {
                                const isEnrolled = cls.enrolledStudentIds.includes(currentUserId);
                                const isFull = cls.studentCount >= 10;

                                return (
                                    <tr key={cls.id} style={{ borderBottom: '1px solid #eee', backgroundColor: isEnrolled ? '#f8fff9' : 'white' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#198754' }}>{cls.classCode}</td>
                                        <td style={{ padding: '15px', fontWeight: '500' }}>{cls.subject} <br/><span style={{fontSize: '12px', color: '#666'}}>{cls.subjectCode}</span></td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>{cls.credits}</td>
                                        <td style={{ padding: '15px', color: '#555' }}>{cls.lecturer}</td>
                                        
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <span style={{ 
                                                backgroundColor: isFull ? '#f8d7da' : '#e2e3e5', 
                                                color: isFull ? '#721c24' : '#383d41', 
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' 
                                            }}>
                                                {cls.studentCount} / 10
                                            </span>
                                        </td>
                                        
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {isEnrolled ? (
                                                <button onClick={() => handleDrop(cls.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaTimesCircle /> Hủy Lớp
                                                </button>
                                            ) : isFull ? (
                                                <button disabled style={{ backgroundColor: '#e9ecef', color: '#6c757d', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaBan /> Lớp Đầy
                                                </button>
                                            ) : (
                                                <button onClick={() => handleEnroll(cls.id)} style={{ backgroundColor: '#0d6efd', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaCheckCircle /> Đăng ký
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Không có lớp học nào đang mở.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </StudentLayout>
    );
}