import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminSubjects from './pages/AdminSubjects';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang mặc định là Đăng nhập */}
        <Route path="/" element={<Login />} />
        
        {/* Các trang sau khi đăng nhập */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/lecturer" element={<LecturerDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        
        {/* Nếu gõ đường dẫn bậy bạ thì đẩy về trang chủ */}
        <Route path="*" element={<Navigate to="/" />} />

        
      </Routes>
    </BrowserRouter>
  )
}

export default App;