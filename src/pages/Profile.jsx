import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../api/axios';
import s from './Profile.module.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    points: 0,
    avatar: '/Resources/default-avatar.png'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Чистый URL сервера без /api на конце
  const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return url.replace(/\/api$/, ''); // Убираем /api, если он там есть
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/mobile/profile');
        const data = response.data;
        
        const baseUrl = getBaseUrl();
        setUser({
          name: data.name,
          email: data.email,
          points: data.totalPoints,
          // Если photoUrl пустой, оставляем дефолт. 
          avatar: data.photoUrl 
            ? `${baseUrl}/${data.photoUrl}` 
            : '/Resources/default-avatar.png'
        });
      } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
        if (error.response?.status === 401) navigate('/'); // Если токен протух
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleAvatarChange = async (e) =>{
    const file = e.target.files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try{
      const response = await api.post('/mobile/upload-avatar', formData,{
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const baseUrl = getBaseUrl();
      const newPhotoUrl = `${baseUrl}/${response.data.photoUrl}`;
      setUser(prev => ({ ...prev, avatar: newPhotoUrl }));
      alert("Фото обновлено!");
    }catch(error){
      console.error("Ошибка загрузки фото:", error);
      alert("Не удалось загрузить фото");
    }
  };

  const handleSave = async () => {
   try {
      const response = await api.post('/mobile/change-nickname', {
        newNickname: user.name
      });

      if (response.data.isSuccess) {
        alert(response.data.message);
        // Обновляем локальное состояние на случай, если бэк как-то отформатировал имя
        setUser(prev => ({ ...prev, name: response.data.newNickname }));
      }
    } catch (error) {
      console.error("Ошибка при смене имени:", error);
      // Выводим сообщение об ошибке с бэкенда (например, "Никнейм занят")
      const errorMessage = error.response?.data?.message || "Ошибка сервера";
      alert(errorMessage);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token'); // Чистим токен
    navigate('/');
  };
  if (loading) return <div className={s.profilePage}><Header /><p className={s.loadingText}>Загрузка...</p></div>;

  return (
    <div className={s.profilePage}>
      <Header />
      <div className={s.profileContainer}>
        <div className={s.profileCard}>
          <div className={s.profileLeft}>
            <img src={user.avatar} alt="User Avatar" onError={(e) => e.target.src = '/Resources/default-avatar.png'} />
            <label className={s.uploadLabel}>
              <i className='bx bx-upload'></i> Загрузить фото
              <input
                type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className={s.profileRight}>
            <h2>Профиль<br />пользователя</h2>
            
            <div className={s.inputGroup}>
              <label>Имя</label>
              <input 
                type="text" 
                value={user.name} 
                onChange={(e) => setUser({...user, name: e.target.value})}
                placeholder="Имя пользователя" 
              />
            </div>

            <div className={s.inputGroup}>
              <label>Email</label>
              <input 
                type="email" 
                value={user.email} 
                readOnly 
                style={{ cursor: 'not-allowed', opacity: 0.7 }}
              />
            </div>

            <div className={s.pointsPill}>
              <i className='bx bxs-zap'></i> Баллы: <span>{user.points}</span>
            </div>

            <div className={s.profileActions}>
              <button className={s.btnSave} onClick={handleSave}>Сохранить</button>
              <a href="/" className={s.btnLogout} onClick={handleLogout}>Выйти</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;