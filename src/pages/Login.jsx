import React,{useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Login = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const handleSubmit = async (e) => {   
    e.preventDefault();
    console.log("Отправка запроса на сервер...");
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Успешный вход:", result);
        
        localStorage.setItem('token', result.token);
        
        alert("Добро пожаловать!");
        navigate('/map'); 
      } 
      else {
        const errorData = await response.json();
        alert("Ошибка: " + (errorData.error || "Неверный логин или пароль"));
      }
    } catch (error) {
      console.error("Критическая ошибка:", error);
      alert("Сервер недоступен. Проверьте запущен ли бэкенд.");
    }   
  };

  return (
    <div className="container">
      <h1>Добро пожаловать</h1>
      <p className="subtitle">Чистый город</p>

      <form id="loginForm" onSubmit={handleSubmit}>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <div className="buttons">
          <button className="btn" type="submit">Войти</button>
        </div>

        <div className="form-links">
          <Link to="/register" className="register-link">
            У вас нет аккаунта? Зарегистрируйтесь!
          </Link>
        </div>
        
        <div className="form-links">
          <Link to="/forgot-password" className="register-link">
            Забыли пароль? Кликни сюда чтобы восстановить!
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login