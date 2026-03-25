import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const [name, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = { name, email, password };

    try {
      const response = await api.post('/auth/register', data);

      if (response.status === 200 || response.status === 201) {
        alert("Регистрация успешна!");
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        navigate('/map'); 
      }
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      
      const message = error.response?.data?.message || "Не удалось зарегистрироваться. Проверьте данные.";
      alert("Ошибка: " + message);
    } finally {
      setLoading(false);
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
            value={name}
            onChange={(e) => setUsername(e.target.value)}
          />
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