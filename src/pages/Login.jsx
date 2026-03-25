import React,{useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';


const Login = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {   
    e.preventDefault();
    setLoading(true);
    console.log("Отправка запроса на сервер...");

    const loginData = {
      email: email,
      password: password
    };
  
   try {
      console.log("Попытка входа...");
      const response = await api.post('/auth/login', loginData);

      const result = response.data;

      if (response.status === 200) {
        console.log("Успешный вход:", result);
        
        if (result.token) {
          localStorage.setItem('token', result.token);
        }

        if (result.username) {
          localStorage.setItem('username', result.name);
        }

        navigate('/map'); 
      }
    } catch (error) {
      console.error("Ошибка при входе:", error);
      
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.message || 
                       "Неверный логин или пароль";
                       
      alert("Ошибка: " + errorMsg);
    } finally {
      setLoading(false);
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