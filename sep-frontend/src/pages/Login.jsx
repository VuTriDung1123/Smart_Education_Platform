import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authService.login(username, password);
            const role = localStorage.getItem('role');
            
            // 🔥 PHÂN LUỒNG TẠI ĐÂY
            if (role === 'ADMIN') {
                navigate('/admin');
            } else if (role === 'LECTURER') {
                navigate('/lecturer');
            } else {
                navigate('/student'); // Mặc định là sinh viên
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' }}>
                <h2 style={{ textAlign: 'center', color: '#1890ff', marginBottom: '20px' }}>SEP SYSTEM</h2>
                {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Tên đăng nhập" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Mật khẩu" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        required
                    />
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ĐĂNG NHẬP
                    </button>
                </form>
            </div>
        </div>
    );
}