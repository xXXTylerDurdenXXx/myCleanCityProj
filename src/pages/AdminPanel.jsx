import React, { useState } from 'react';
import Header from '../components/Header';
import s from './AdminPanel.module.css';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const users = [
        { id: 1, name: "Иван Иванов", email: "ivan@mail.ru", role: "User", points: 150 },
        { id: 2, name: "Tyler Durden", email: "fight@club.com", role: "Admin", points: 999 },
    ];

    const reports = [
        { id: 101, user: "Иван Иванов", type: "Пластик", status: "На проверке", img: "https://via.placeholder.com/100" },
    ];
    const handleEdit = (item) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
    if(window.confirm("Удалить пользователя?")) {
        setUsers(users.filter(user => user.id !== id));
    }
    };
    const handleSave = (updatedUser) => {
    // Обновляем список пользователей локально
    const updatedList = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedList);
    
    setIsEditModalOpen(false);
    alert("Данные пользователя обновлены!");
    };



    return(
        <div className={s.adminWrapper}>
            <Header/>
            <div className={s.mainContainer}>
                {/* Боковое меню админки */}
                <aside className={s.sidebar}>
                    <h2 className={s.sidebarTitle}>Админ-панель</h2>
                    <button className={activeTab === 'users' ? s.activeBtn : s.btn} onClick={() => setActiveTab('users')}>
                        <i className='bx bx-user'></i> Пользователи
                    </button>
                    <button className={activeTab === 'points' ? s.activeBtn : s.btn} onClick={() => setActiveTab('points')}>
                        <i className='bx bx-map-pin'></i> Точки сбора
                    </button>
                    <button className={activeTab === 'reports' ? s.activeBtn : s.btn} onClick={() => setActiveTab('reports')}>
                        <i className='bx bx-file'></i> Отчеты
                    </button>
                </aside>

                {/* Основной контент */}
                <main className={s.content}>
                    {activeTab === 'users' && (
                        <div className={s.card}>
                            <h3>Управление пользователями</h3>
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        <th>Имя</th>
                                        <th>Email</th>
                                        <th>Роль</th>
                                        <th>Баллы</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td><span className={s.badge}>{u.role}</span></td>
                                            <td>{u.points}</td>
                                            <td>
                                                <button className={s.editBtn} onClick={() => handleEdit(u)}>
                                                    <i className='bx bx-edit'></i>
                                                </button>
                                                <button className={s.deleteBtn} onClick={() => handleDelete(u.id)}>
                                                    <i className='bx bx-trash'></i>
                                                </button>
                                            </td>
                                        </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* 2. ВКЛАДКА ТОЧКИ СБОРА */}
                    {activeTab === 'points' && (
                    <div className={s.card}>
                        <h3>Управление точками на карте</h3>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Тип</th>
                                    <th>Координаты</th>
                                    <th>Адрес</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </div>
                    )}
                    
                    {/* 3. ВКЛАДКА ОТЧЕТЫ */}
                    {activeTab === 'reports' && (
                    <div className={s.card}>
                        <h3>История отправленных отчетов</h3>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    <th>Фото</th>
                                    <th>От кого</th>
                                    <th>Тип</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <img src={r.img} alt="report" className={s.tableImg} />
                                        </td>
                                        <td>{r.user}</td>
                                        <td>{r.type}</td>
                                        <td>
                                            <span className={r.status === 'Принят' ? s.statusOk : s.statusWait}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={s.deleteBtn} onClick={() => handleDelete(u.id)}>
                                                    <i className='bx bx-trash'></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                </main>
            </div>
            {isEditModalOpen && (
            <div className={s.modalOverlay}>
                <div className={s.modal}>
                    <div className={s.modalHeader}>
                        <h3>Редактирование пользователя</h3>
                        <button onClick={() => setIsEditModalOpen(false)} className={s.closeModal}>&times;</button>
                    </div>
                    
                    <div className={s.modalBody}>
                        {/* ИМЯ */}
                        <div className={s.inputGroup}>
                            <label>Имя пользователя</label>
                            <input 
                                type="text" 
                                value={editingItem.name} 
                                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                            />
                        </div>

                        {/* РОЛЬ */}
                        <div className={s.inputGroup}>
                            <label>Роль</label>
                            <select 
                                value={editingItem.role} 
                                onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                                className={s.select}
                            >
                                <option value="User">User</option>
                                <option value="Moderator">Moderator</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {/* БАЛЛЫ */}
                        <div className={s.inputGroup}>
                            <label>Количество баллов</label>
                            <input 
                                type="number" 
                                value={editingItem.points} 
                                onChange={(e) => setEditingItem({...editingItem, points: Number(e.target.value)})}
                            />
                        </div>

                        <button className={s.saveBtn} onClick={() => handleSave(editingItem)}>
                            Сохранить изменения
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default AdminPanel;