import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import s from './Leaderboard.module.css';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [filter, setFilter] = useState('day'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {

        const mockData = [
          { id: 1, name: "Иван", totalPoints: 1250 },
          { id: 2, name: "Tyler Durden", totalPoints: 1100 },
          { id: 3, name: "Анна", totalPoints: 950 },
          { id: 4, name: "Дмитрий Песков", totalPoints: 800 },
          { id: 5, name: "Елена му", totalPoints: 720 },
        ];
        
        /* Когда бэкенд оживет:
        const response = await fetch(`/api/leaderboard?period=${filter}`);
        const data = await response.json();
        setLeaders(data);
        */
        
        setLeaders(mockData);
      } catch (error) {
        console.error("Ошибка загрузки лидеров:", error);
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
                      <td className={s.pointsCol}>{user.totalPoints || 0}</td>
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