import React, { useEffect, useState } from 'react';
import studentService from '../services/studentService';
import StudentLayout from '../components/StudentLayout';
import { FaArrowLeft, FaBullhorn, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function StudentPortal() {
    const [activeTab, setActiveTab] = useState('DASHBOARD');
    const [classes, setClasses] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    
    const [selectedClass, setSelectedClass] = useState(null);
    const [classSubTab, setClassSubTab] = useState('GRADES'); // 'GRADES', 'ANNOUNCEMENTS'
    
    const [grades, setGrades] = useState(null);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const classData = await studentService.getMyClasses();
            setClasses(classData);
            
            const dashData = await studentService.getDashboard();
            setDashboardData(dashData);
        } catch { 
            console.error("Lỗi tải dữ liệu sinh viên"); 
        }
    };

    const handleSelectClass = async (cls) => {
        setSelectedClass(cls);
        setClassSubTab('GRADES');
        try {
            const gr = await studentService.getMyGrades(cls.classId);
            setGrades(gr);
            const ann = await studentService.getAnnouncements(cls.classId);
            setAnnouncements(ann);
        } catch { console.error("Lỗi tải chi tiết lớp"); }
    };

    // ==========================================
    // RENDER: TAB TỔNG QUAN (DASHBOARD)
    // ==========================================
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

    // ==========================================
    // RENDER: CHI TIẾT LỚP HỌC & ĐIỂM SỐ
    // ==========================================
    const renderClassDetail = () => {
        if (!selectedClass) return null;

        let totalScore = null;
        if (grades && grades.processScore !== null && grades.finalScore !== null) {
            totalScore = (grades.processScore * 0.4 + grades.finalScore * 0.6).toFixed(1);
        }

        return (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '25px', animation: 'fadeIn 0.3s' }}>
                <button onClick={() => setSelectedClass(null)} style={{ background: 'none', border: 'none', color: '#006666', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0, marginBottom: '20px', fontWeight: 'bold' }}>
                    <FaArrowLeft /> Trở về danh sách lớp
                </button>
                <h2 style={{ margin: '0 0 5px 0', color: '#006666' }}>{selectedClass.subjectName}</h2>
                <p style={{ color: '#666', margin: '0 0 20px 0' }}>Mã lớp: <strong>{selectedClass.classCode}</strong> | Giảng viên: <strong>{selectedClass.lecturerName}</strong></p>

                <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #eee', marginBottom: '20px' }}>
                    <div onClick={() => setClassSubTab('GRADES')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'GRADES' ? '3px solid #006666' : '3px solid transparent', color: classSubTab === 'GRADES' ? '#006666' : '#666' }}>
                        Bảng điểm của tôi
                    </div>
                    <div onClick={() => setClassSubTab('ANNOUNCEMENTS')} style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold', borderBottom: classSubTab === 'ANNOUNCEMENTS' ? '3px solid #ffc107' : '3px solid transparent', color: classSubTab === 'ANNOUNCEMENTS' ? '#ffc107' : '#666' }}>
                        <FaBullhorn /> Thông báo lớp ({announcements.length})
                    </div>
                </div>

                {classSubTab === 'GRADES' && (
                    <div style={{ maxWidth: '700px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #ddd' }}>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '15px', backgroundColor: '#f8f9fa', width: '60%' }}>Điểm Quá trình (40%)</th>
                                    <td style={{ padding: '15px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: '#006666' }}>{grades?.processScore ?? '-'}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: '15px', backgroundColor: '#f8f9fa' }}>Điểm Thi cuối kỳ (60%)</th>
                                    <td style={{ padding: '15px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: '#006666' }}>{grades?.finalScore ?? '-'}</td>
                                </tr>
                                <tr style={{ backgroundColor: '#006666', color: 'white' }}>
                                    <th style={{ padding: '15px', fontSize: '18px' }}>TỔNG KẾT HỌC PHẦN</th>
                                    <td style={{ padding: '15px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: totalScore >= 4 ? '#ffc107' : (totalScore === null ? 'white' : '#ffc107') }}>
                                        {totalScore ?? 'Chưa tổng kết'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {totalScore !== null && (
                            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: totalScore >= 4 ? '#d4edda' : '#f8d7da', color: totalScore >= 4 ? '#155724' : '#721c24', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                {totalScore >= 4 ? <FaCheckCircle size={20} /> : <FaExclamationCircle size={20} />}
                                {totalScore >= 4 ? 'Chúc mừng! Bạn đã đủ điểm qua môn này.' : 'Cảnh báo: Bạn chưa đủ điểm qua môn.'}
                            </div>
                        )}
                    </div>
                )}

                {classSubTab === 'ANNOUNCEMENTS' && (
                    <div>
                        {announcements.length === 0 ? <p style={{ color: '#888' }}>Giảng viên chưa có thông báo nào.</p> : announcements.map(a => (
                            <div key={a.id} style={{ backgroundColor: '#f8f9fa', border: '1px solid #eee', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #ffc107' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{a.title}</h3>
                                <span style={{ fontSize: '12px', color: '#888' }}>Đăng lúc: {new Date(a.createdAt).toLocaleString('vi-VN')}</span>
                                <p style={{ margin: '15px 0 0 0', color: '#444', fontSize: '15px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{a.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <StudentLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            
            {/* TAB TỔNG QUAN NĂNG LỰC */}
            {activeTab === 'DASHBOARD' && renderDashboard()}
            
            {/* TAB KẾT QUẢ HỌC TẬP (Hiển thị danh sách lớp) */}
            {activeTab === 'GRADES' && (selectedClass ? renderClassDetail() : 
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.5s' }}>
                    {classes.length === 0 ? <p>Bạn chưa được đăng ký vào lớp học nào.</p> : classes.map(c => (
                        <div key={c.classId} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', borderTop: '5px solid #006666' }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#006666' }}>{c.subjectName}</h3>
                            <span style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>Mã lớp: {c.classCode}</span>
                            <p style={{ margin: '0 0 20px 0', color: '#444', fontSize: '14px' }}>Giảng viên: <strong>{c.lecturerName}</strong></p>
                            
                            <button onClick={() => handleSelectClass(c)} style={{ marginTop: 'auto', backgroundColor: '#ffc107', color: '#333', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: '0.2s' }}>
                                Xem Điểm & Thông Báo
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* CÁC TAB KHÁC (Chưa làm, hiển thị thông báo) */}
            {(activeTab === 'REGISTRATION' || activeTab === 'TIMETABLE' || activeTab === 'CURRICULUM') && (
                <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#666', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <FaExclamationCircle size={50} color="#ffc107" style={{ marginBottom: '15px' }} />
                    <h2>Tính năng đang phát triển</h2>
                    <p>Hệ thống đang được nâng cấp. Vui lòng quay lại sau!</p>
                </div>
            )}

        </StudentLayout>
    );
}