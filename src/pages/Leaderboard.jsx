import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import s from './Leaderboard.module.css';
import api from '../api/axios';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [filter, setFilter] = useState('month'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        const response = await api.get('/user/leaderboard');
        
        // Мапим данные, если ключи в DTO (Username/Points) отличаются от тех, что были в моках
        const data = response.data.map((user, index) => ({
          id: index, // Используем индекс как временный id
          name: user.username, 
          totalPoints: user.points 
        }));

        setLeaders(data);

      } catch (error) {
        console.error("Ошибка загрузки лидеров:", error);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [filter]);

  return (
    <>
      <Header />
      <div className={s.leaderboardWrapper}>
        <div className={s.filterButtons}>
          <button className={filter === 'day' ? s.active : ''} onClick={() => setFilter('day')}>День</button>
          <button className={filter === 'week' ? s.active : ''} onClick={() => setFilter('week')}>Неделя</button>
          <button className={filter === 'month' ? s.active : ''} onClick={() => setFilter('month')}>Месяц</button>
        </div>

        <div className={s.leaderboardCard}>
          <h1 className={s.title}>Таблица лидеров</h1>
          <p className={s.subtitle}>Лучшие активисты города</p>

          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.rankCol}>Место</th>
                <th>Пользователь</th>
                <th className={s.pointsCol}>Баллы</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{textAlign: 'center'}}>Загрузка...</td></tr>
              ) : (
                leaders.map((user, index) => {
                  const rank = index + 1;
                  const rowClass = rank === 1 ? s.top1 : rank === 2 ? s.top2 : rank === 3 ? s.top3 : '';
                  
                  return (
                    <tr key={user.id} className={rowClass}>
                      <td className={s.rankCol}>{rank}</td>
                      <td>{user.name || "Аноним"}</td>
                      <td className={s.pointsCol}>
                        <strong>{user.totalPoints.toLocaleString()}</strong>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;