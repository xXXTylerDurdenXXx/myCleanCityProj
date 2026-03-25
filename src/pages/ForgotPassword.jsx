import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: Email, 2: Код, 3: Новый пароль
  const [status, setStatus] = useState({ message: '', type: '' });
  const [timer, setTimer] = useState(0); // Таймер для повторной отправки
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Логика таймера
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Шаг 1: Запрос кода
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus({ message: "Код отправлен на почту!", type: "success" });
      setStep(2);
      setTimer(60);
    } catch (error) {
      setStatus({ message: error.response?.data?.error || "Ошибка отправки", type: "error" });
    } finally { setLoading(false); }
  };
  
  // Шаг 2: Сброс пароля 
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return setStatus({ message: "Пароли не совпадают", type: "error" });
    }

    setLoading(true);
    try {
      // Данные для ResetPasswordRequest на бэкенд
      const resetData = {
        Email: email,
        Code: code,
        NewPassword: newPassword
      };
      await api.post('/auth/reset-password', resetData);
      
      setStatus({ message: "Пароль успешно изменен! Входим...", type: "success" });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setStatus({ message: error.response?.data?.error || "Неверный код или пароль", type: "error" });
    } finally { setLoading(false); }
  };
  const statusStyle = (type) => ({ color: type === 'error' ? '#e53e3e' : '#38a169', textAlign: 'center', marginTop: '10px' });

  return (
    <div className="container">
      <h1>Восстановление</h1>
      <p className="subtitle">Чистый город</p>

      {/* ШАГ 1: ВВОД EMAIL */}
      {step === 1 && (
        <form onSubmit={handleRequestCode}>
          <div className="input-group">
            <img src="/Resources/mail.png" alt="Mail" />
            <input type="email" placeholder="Электронная почта" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Отправка..." : "Получить код"}
          </button>
        </form>
      )}

      {/* ШАГ 2: ВВОД КОДА И ПАРОЛЯ*/}
      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <p className="step-text">Введите код из письма для <b>{email}</b> и новый пароль</p>
          <div className="input-group">
            <img src="/Resources/key.png" alt="Код" />
            <input type="text" placeholder="Код подтверждения" value={code} onChange={(e)=>setCode(e.target.value)} required />
          </div>
          
          <div className="input-group">
            <img src="/Resources/lock.png" alt="Пароль" />
            <input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required minLength="6" />
          </div>

          <div className="input-group">
            <img src="/Resources/lockOpen.png" alt="Пароль" />
            <input type="password" placeholder="Повторите пароль" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Обновление..." : "Сбросить пароль"}
          </button>
          <div style={{textAlign: 'center', marginTop: '15px'}}>
            {timer > 0 ? (
              <span style={{fontSize: '12px', color: '#a0aec0'}}>Повторная отправка через {timer}с</span>
            ) : (
              <button type="button" onClick={handleRequestCode} style={{background:'none', border:'none', color:'#4a90e2', cursor:'pointer', textDecoration:'underline'}}>
                Отправить код еще раз
              </button>
            )}
          </div>
        </form>
      )}

      {status.message && (
        <div className={`status-message ${status.type}`} style={statusStyle(status.type)}>
          {status.message}
        </div>
      )}

      <div className="form-links">
        <Link to="/" className="register-link">Вспомнили пароль? Войти</Link>
      </div>
    </div>
  );
};

// Вспомогательные стили
const iconStyle = { marginLeft: '15px', fontSize: '20px', color: '#a0aec0' };
const linkBtnStyle = { background: 'none', border: 'none', color: '#764ba2', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' };
const statusStyle = (type) => ({
  marginTop: '20px', padding: '10px', borderRadius: '8px', fontSize: '13px', textAlign: 'center',
  backgroundColor: type === 'success' ? '#e6fffa' : '#fff5f5',
  color: type === 'success' ? '#2c7a7b' : '#c53030',
  border: `1px solid ${type === 'success' ? '#b2f5ea' : '#feb2b2'}`
});

export default ForgotPassword;
      

