import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import userService from '../services/userService';
import classroomService from '../services/classroomService';
import subjectService from '../services/subjectService';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaCheckCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalLecturers: 0,
        totalSubjects: 0,
        totalClasses: 0,
    });
    const [roleData, setRoleData] = useState([]);
    const [classStatusData, setClassStatusData] = useState([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [users, classes, subjects] = await Promise.all([
                userService.getAllUsers(),
                classroomService.getAllClassrooms(),
                subjectService.getAllSubjects()
            ]);

            // 1. Tính toán thẻ thống kê nhanh
            const students = users.filter(u => u.roles?.some(r => r.name === 'STUDENT')).length;
            const lecturers = users.filter(u => u.roles?.some(r => r.name === 'LECTURER')).length;
            const admins = users.filter(u => u.roles?.some(r => r.name === 'ADMIN')).length;

            setStats({
                totalStudents: students,
                totalLecturers: lecturers,
                totalSubjects: subjects.length,
                totalClasses: classes.length
            });

            // 2. Data cho Biểu đồ cột (Phân bố người dùng)
            setRoleData([
                { name: 'Sinh viên', quantity: students, fill: '#28a745' },
                { name: 'Giảng viên', quantity: lecturers, fill: '#fd7e14' },
                { name: 'Quản trị viên', quantity: admins, fill: '#007bff' },
            ]);

            // 3. Data cho Biểu đồ tròn (Tình trạng sĩ số lớp học)
            const fullClasses = classes.filter(c => c.studentCount >= 10).length;
            const availableClasses = classes.length - fullClasses;
            setClassStatusData([
                { name: 'Lớp đã đầy (>= 10)', value: fullClasses, color: '#dc3545' },
                { name: 'Lớp còn chỗ', value: availableClasses, color: '#17a2b8' }
            ]);

        } catch (error) {
            console.error("Lỗi tải Dashboard:", error);
        }
    };

    return (
        <AdminLayout activeTab="DASHBOARD">
            <div style={{ animation: 'fadeIn 0.5s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h2 style={{ color: '#1a1d21', margin: 0 }}>Phân Tích Dữ Liệu Hệ Thống (Analytics)</h2>
                </div>

                {/* 4 THẺ THỐNG KÊ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    <StatCard title="Sinh Viên" value={stats.totalStudents} icon={<FaUserGraduate size={40} />} color="#28a745" />
                    <StatCard title="Giảng Viên" value={stats.totalLecturers} icon={<FaChalkboardTeacher size={40} />} color="#fd7e14" />
                    <StatCard title="Môn Học" value={stats.totalSubjects} icon={<FaBook size={40} />} color="#6f42c1" />
                    <StatCard title="Lớp Học Phần" value={stats.totalClasses} icon={<FaCheckCircle size={40} />} color="#17a2b8" />
                </div>

                {/* KHU VỰC BIỂU ĐỒ */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    {/* Biểu đồ Cột */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ color: '#333', marginTop: 0, marginBottom: '20px' }}>Phân bố tài khoản người dùng</h4>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer>
                                <BarChart data={roleData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#f4f6f9'}} />
                                    <Bar dataKey="quantity" name="Số lượng" radius={[4, 4, 0, 0]}>
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Biểu đồ Tròn */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ color: '#333', marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>Tỉ lệ lấp đầy Lớp học</h4>
                        <div style={{ width: '100%', height: '250px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={classStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {classStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
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
        </AdminLayout>
    );
}

// Component phụ cho Thẻ thống kê
const StatCard = ({ title, value, icon, color }) => (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `5px solid ${color}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div>
            <p style={{ margin: 0, color: '#666', fontSize: '14px', fontWeight: 'bold' }}>{title}</p>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#1a1d21' }}>{value}</h2>
        </div>
        <div style={{ color: color, opacity: 0.8 }}>{icon}</div>
    </div>
);