import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import s from './Profile.module.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    points: 0,
    avatar: '/Resources/default-avatar.png'
  });

  useEffect(() => {
    const fetchUser = async () => {
      const mockUser = {
        name: 'Tyler Durden',
        email: 'tyler@fightclub.com',
        points: 450,
        avatar: '/Resources/default-avatar.png'
      };
      setUser(mockUser);
    };

    fetchUser();
  }, []);

  const handleSave = () => {
    console.log("Данные сохранены:", user);
    alert("Профиль успешно обновлен!");
  };

  const handleLogout = (e) => {
    e.preventDefault();
    console.log("Выход из системы...");

  };

  return (
    <div className={s.profilePage}>
      <Header />
      <div className={s.profileContainer}>
        <div className={s.profileCard}>
          <div className={s.profileLeft}>
            <img src={user.avatar} alt="User Avatar" />
            <label className={s.uploadLabel}>
              <i className='bx bx-upload'></i> Загрузить фото
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