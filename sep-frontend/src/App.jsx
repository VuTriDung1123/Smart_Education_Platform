import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // 🔥 CHỈNH LẠI: Trỏ đúng vào file AdminDashboard
import AdminUsers from './pages/AdminUsers';         // 🔥 CHỈNH LẠI: Trỏ đúng vào file AdminUsers
import AdminSubjects from './pages/AdminSubjects';
import AdminClassrooms from './pages/AdminClassrooms';
import AdminPortal from './pages/AdminPortal';
import StudentPortal from './pages/StudentPortal';
import LecturerPortal from './pages/LecturerPortal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang mặc định là Đăng nhập */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* ==========================================
            CÁC TRANG CỦA ADMIN
        ========================================== */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        <Route path="/admin/classrooms" element={<AdminClassrooms />} />
        <Route path="/admin/semesters" element={<AdminPortal />} />
        
        {/* ==========================================
            CÁC TRANG CỦA GIẢNG VIÊN VÀ SINH VIÊN
        ========================================== */}
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/lecturer" element={<LecturerPortal />} />
        
        {/* Nếu gõ đường dẫn bậy bạ thì đẩy về trang login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;