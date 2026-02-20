export default function LecturerDashboard() {
    const fullName = localStorage.getItem('fullName');
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1 style={{ color: 'orange' }}>👨‍🏫 Khu vực của GIẢNG VIÊN</h1>
            <h2>Xin chào thầy/cô: {fullName}</h2>
            <button onClick={() => { localStorage.clear(); window.location.href = '/' }}>Đăng xuất</button>
        </div>
    );
}