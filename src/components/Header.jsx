import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import s from './Header.module.css'; 

const Header = () => {
    const token = localStorage.getItem('token');

    const parseJwt = (token) => {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        } catch (e) { return null; }
    };

    const user = parseJwt(token);
    // Проверяем, админ ли пользователь
    const isAdmin = user?.role === "Admin";
    const isModerator = user?.role === "Moderator"

  return (
    <header className={s.header}>
      <div className={s['header-container']}> 
        <Link to="/map" className={s.logo}>
          <img src="/Resources/robot.png" alt="logo" />
          <span>Чистый город</span>
        </Link>
        <nav className={s['nav-menu']}>
          {isAdmin && (
            <Link translate='no' to="/admin" className={s['nav-link']}>
              <i className={s['nav-link']}></i> Админ-панель
            </Link>
          )}
          <Link to="/map" className={s['nav-link']}>Карта</Link>
          <Link to="/leaderboard" className={s['nav-link']}>Лидеры</Link>
          <Link to="/profile" className={s['nav-link']}>Профиль</Link>
          {(isAdmin || isModerator) && (
            <Link translate='no' to="/report" className={s['nav-link']}>
              <i className={s['nav-link']}></i> Фото-отчеты
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;