import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MapPage from './pages/MapPage';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import ReportReview from './pages/ReportReview';
import SupportChat from './pages/SupportChat';
import ModeratorChat from './pages/ModeratorChat';
import './App.css';

const App = () => {
  const token = localStorage.getItem('token');

  // Функция для расшифровки JWT 
  const parseJwt = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) { return null; }
  };

  const user = parseJwt(token);
  // ОБЪЯВЛЯЕМ isAdmin здесь:
  const isAdmin = user?.role === "Admin";
  const isModerator = user?.role === "Moderator";
  const isUser = user?.role === "User";

  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="app-container"><Login /></div>} />
        <Route path="/register" element={<div className="app-container"><Register /></div>} />
        <Route path='/forgot-password' element={<div className="app-container"><ForgotPassword /></div>} />
        <Route path='/map' element={<MapPage/>} />
        <Route path='/leaderboard' element={<Leaderboard/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/admin' element={isAdmin ? <AdminPanel /> : <Navigate to="/map" />} />
        <Route path='/supportHub' element={isAdmin || isModerator ? <ModeratorChat /> : <Navigate to="/map" /> } />
        <Route path='/report' element={isAdmin || isModerator ? <ReportReview /> : <Navigate to="/map" />} />
        <Route path='/support' element={isUser ? <SupportChat/> : <Navigate to="/map" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;