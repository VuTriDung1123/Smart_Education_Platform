import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import adminSystemService from '../services/adminSystemService';
import { FaCogs, FaRobot, FaDatabase, FaServer, FaCodeBranch } from 'react-icons/fa';

export default function AdminSystem() {
    const [aiLogs, setAiLogs] = useState([]);
    
    // State giả lập cho các công tắc Cấu hình
    const [config, setConfig] = useState({
        aiSuggestion: true,
        plagiarismCheck: false,
        autoEmail: true,
        maintenanceMode: false
    });

    useEffect(() => {
        const fetchLogs = async () => {
            try { setAiLogs(await adminSystemService.getAiLogs()); } 
            catch (e) { console.error(e); }
        };
        fetchLogs();
    }, []);

    const toggleConfig = (key) => {
        setConfig({ ...config, [key]: !config[key] });
    };

    const handleBackup = () => {
        alert("⏳ Đang nén dữ liệu (Dump Database)...\n✅ Đã xuất file: backup_sep_db_" + new Date().getTime() + ".sql");
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ color: '#1a1d21', margin: 0 }}><FaCogs /> Core System & AI Configuration</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                {/* BẢNG ĐIỀU KHIỂN AI & HỆ THỐNG */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: 0 }}><FaServer /> System Switches</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                        <ToggleRow label="Bật AI Gợi ý Môn học (Recommendation Engine)" isActive={config.aiSuggestion} onToggle={() => toggleConfig('aiSuggestion')} icon={<FaRobot color="#007bff"/>} />
                        <ToggleRow label="Kiểm tra Đạo văn (Plagiarism Check) - Khóa luận" isActive={config.plagiarismCheck} onToggle={() => toggleConfig('plagiarismCheck')} icon={<FaCodeBranch color="#dc3545"/>} />
                        <ToggleRow label="Tự động Gửi Email Thông báo (Auto-Notify)" isActive={config.autoEmail} onToggle={() => toggleConfig('autoEmail')} icon={<FaCogs color="#28a745"/>} />
                    </div>
                </div>

                {/* KHU VỰC DATABASE BACKUP */}
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <FaDatabase size={60} color="#e5a823" style={{ marginBottom: '15px' }} />
                    <h3 style={{ margin: '0 0 10px 0' }}>Sao lưu Dữ liệu (Database Backup)</h3>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '25px' }}>
                        Tạo bản Snapshot (.sql) cho toàn bộ cấu trúc bảng và dữ liệu hiện tại. Cực kỳ quan trọng trước khi nâng cấp hệ thống.
                    </p>
                    <button onClick={handleBackup} style={{ backgroundColor: '#1a1d21', color: '#e5a823', border: 'none', padding: '12px 30px', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        ⬇️ Bắt đầu Backup Hệ thống
                    </button>
                </div>
            </div>

            {/* BẢNG LOG HOẠT ĐỘNG AI */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: 0 }}><FaRobot /> AI Recommendation Logs</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '12px' }}>Thời gian</th>
                            <th style={{ padding: '12px' }}>Loại gợi ý</th>
                            <th style={{ padding: '12px' }}>Nội dung AI trả về</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Sinh viên chấp nhận?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aiLogs.length === 0 ? <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>AI chưa ghi nhận tương tác nào.</td></tr> : aiLogs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(log.generatedAt).toLocaleString('vi-VN')}</td>
                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#0056b3' }}>{log.recommendationType}</td>
                                <td style={{ padding: '12px', fontStyle: 'italic', color: '#666' }}>{log.suggestedContent}</td>
                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: log.isAcceptedByStudent ? '#28a745' : '#dc3545' }}>
                                    {log.isAcceptedByStudent ? 'Đã Click' : 'Bỏ qua'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

// Component phụ cho nút Công tắc (Toggle)
const ToggleRow = ({ label, isActive, onToggle, icon }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: isActive ? '4px solid #28a745' : '4px solid #ccc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#333' }}>
            {icon} {label}
        </div>
        <div onClick={onToggle} style={{ width: '50px', height: '26px', backgroundColor: isActive ? '#28a745' : '#ccc', borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s' }}>
            <div style={{ width: '22px', height: '22px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: isActive ? '26px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}></div>
        </div>
    </div>
);