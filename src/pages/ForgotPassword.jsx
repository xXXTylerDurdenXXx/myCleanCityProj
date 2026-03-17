import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({ message: '', type: '' });
    console.log("Запрос на восстановление для:", email);
    
    try {
      /* В будущем здесь будет реальный запрос к твоему бэкенду:
         const response = await fetch('/api/auth/forgot-password', { ... });
      */
      
      // Имитируем успешный ответ сервера
      setStatus({ 
        message: "Инструкции по восстановлению отправлены на вашу почту!", 
        type: "success" 
      });
      
    } catch (error) {
      setStatus({ 
        message: "Произошла ошибка. Попробуйте позже.", 
        type: "error" 
      });
    }
  };
  return (
    <div className="container">
      <h1>Восстановление</h1>
      <p className="subtitle">Чистый город</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <img src="/Resources/mail.png" alt="Почта" />
          <input 
            type="email" 
            placeholder="Введите электронную почту" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        {status.message && (
          <div 
            className={`status-message ${status.type}`} 
            style={{
              marginBottom: '20px',
              fontSize: '13px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: status.type === 'success' ? '#e6fffa' : '#fff5f5',
              color: status.type === 'success' ? '#2c7a7b' : '#c53030',
              border: `1px solid ${status.type === 'success' ? '#b2f5ea' : '#feb2b2'}`,
              textAlign: 'center'
            }}
          >
            {status.message}
          </div>
        )}

        <button className="btn" type="submit">
          Отправить новый пароль
        </button>

        <div className="form-links">
          
          <Link to="/" className="register-link">
            Обратно к авторизации!
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
      

