import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1); // 1: Email, 2: Код, 3: Новый пароль
  const [status, setStatus] = useState({ message: '', type: '' });
  const [timer, setTimer] = useState(0); // Таймер для повторной отправки

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
    setStatus({ message: "Код отправлен на вашу почту!", type: "success" });
    setStep(2);
    setTimer(60); // Запускаем таймер на 1 минуту
  };

  // Шаг 2: Проверка кода
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code === "1234") { // Заглушка
      setStatus({ message: "Код подтвержден. Придумайте новый пароль", type: "success" });
      setStep(3);
    } else {
      setStatus({ message: "Неверный код", type: "error" });
    }
  };

  // Шаг 3: Смена пароля
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setStatus({ message: "Пароли не совпадают", type: "error" });
    }
    
    // Здесь будет запрос к другу на бэк: api.post('/reset', { email, newPassword })
    setStatus({ message: "Пароль успешно изменен! Входим...", type: "success" });
    
    setTimeout(() => navigate('/'), 2000); // Возвращаем на логин
  };

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
          <button className="btn" type="submit">Получить код</button>
        </form>
      )}

      {/* ШАГ 2: ВВОД КОДА */}
      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <p className="step-text">Введите код из письма для <b>{email}</b></p>
          <div className="input-group">
            <img src="/Resources/key.png" alt="Пароль" />
            <input type="text" placeholder="Код (4 цифры)" value={code} onChange={(e)=>setCode(e.target.value)} maxLength="4" required />
          </div>
          <button className="btn" type="submit">Подтвердить</button>
          
          <div style={{textAlign: 'center', marginTop: '15px'}}>
            {timer > 0 ? (
              <span style={{fontSize: '12px', color: '#a0aec0'}}>Отправить повторно через {timer}с</span>
            ) : (
              <button type="button" onClick={handleRequestCode} style={linkBtnStyle}>Отправить код еще раз</button>
            )}
          </div>
        </form>
      )}

      {/* ШАГ 3: НОВЫЙ ПАРОЛЬ */}
      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <p className="step-text">Установите новый надежный пароль</p>
          <div className="input-group">
            <img src="/Resources/lock.png" alt="Пароль" />
            <input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <img src="/Resources/lockOpen.png" alt="Пароль" />
            <input type="password" placeholder="Повторите пароль" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required />
          </div>
          <button className="btn" type="submit">Обновить пароль</button>
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
      

