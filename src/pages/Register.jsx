import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const data = { username, birthDate, email, password };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Регистрация успешна!");
        localStorage.setItem('token', result.token); 
        navigate('/map'); 
      } else {
        alert("Ошибка: " + (result.message || "Не удалось зарегистрироваться"));
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
      alert("Проблема с подключением к серверу");
    }
  };

  return (
    <div className="container">
      <h1>Рады приветствовать!</h1>

      <form onSubmit={handleRegister}>
        <div className="input-group">
          <img src="/Resources/user.png" alt="Имя пользователя" />
          <input 
            type="text" 
            placeholder="Введите имя пользователя" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <img src="/Resources/calendar.png" alt="Дата рождения" />
          <input 
            type="date" 
            title="Дата рождения" 
            required 
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <small style={{ display: 'block', color: '#1e3a8a', fontSize: '10px', textAlign: 'left', marginLeft: '35px' }}>
            Дата рождения
          </small>
        </div>

        <div className="input-group">
          <img src="/Resources/mail.png" alt="Почта" />
          <input 
            type="email" 
            placeholder="Введите электронную почту" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <img src="/Resources/key.png" alt="Пароль" />
          <input 
            type="password" 
            placeholder="Введите пароль" 
            required 
            minLength="6" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn" type="submit">Зарегистрироваться</button>

        <div className="form-links">
          <Link to="/" className="register-link">
            У вас уже есть аккаунт? Обратно к авторизации!
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;