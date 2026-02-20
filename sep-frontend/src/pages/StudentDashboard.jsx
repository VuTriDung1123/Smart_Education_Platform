export default function StudentDashboard() {
    const fullName = localStorage.getItem('fullName');
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1 style={{ color: 'green' }}>🎓 Không gian của SINH VIÊN</h1>
            <h2>Xin chào bạn: {fullName}</h2>
            <button onClick={() => { localStorage.clear(); window.location.href = '/' }}>Đăng xuất</button>
        </div>
    );
}