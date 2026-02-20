import { useState } from 'react'
import authService from './services/authService'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await authService.login(username, password)
      alert("Đăng nhập thành công! Token đã được lưu.")
      // Sau này sẽ chuyển hướng sang trang Dashboard ở đây
    } catch (error) {
      alert("Đăng nhập thất bại: " + error.message)
    }
  }

  return (
    <div style={{ padding: 50 }}>
      <h1>SEP Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>Đăng nhập</button>
      </form>
    </div>
  )
}

export default App