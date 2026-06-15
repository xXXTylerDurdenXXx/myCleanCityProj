import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import s from './Header.module.css';

const Header = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const parseJwt = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) { return null; }
  };

  const user = parseJwt(token);
  const isAdmin = user?.role === 'Admin';
  const isModerator = user?.role === 'Moderator';

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    isAdmin && { to: '/admin', label: 'Админ-панель' },
    { to: '/map', label: 'Карта' },
    { to: '/leaderboard', label: 'Лидеры' },
    { to: '/profile', label: 'Профиль' },
    (isAdmin || isModerator) && { to: '/report', label: 'Фото-отчеты' },
    (isAdmin || isModerator) && { to: '/supportHub', label: 'Поддержка' },
    !isAdmin && !isModerator && { to: '/support', label: 'Поддержка' },
  ].filter(Boolean);

  return (
    <header className={s.header}>
      <div className={s.headerContainer}>
        <Link to="/map" className={s.logo}>
          <img src="/Resources/robot.png" alt="logo" />
          <span>Чистый город</span>
        </Link>

        <nav className={`${s.navMenu} ${menuOpen ? s.navOpen : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${s.navLink} ${isActive(link.to) ? s.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          className={`${s.burger} ${menuOpen ? s.burgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <div className={s.overlay} onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
};

export default Header;
