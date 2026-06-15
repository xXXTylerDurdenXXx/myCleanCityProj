import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import s from './AdminPanel.module.css';
import api from '../api/axios';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]); 
    const [reports, setReports] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [points, setPoints] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user/admin/all');
            setUsers(response.data);
        } catch (error) {
            console.error("Ошибка загрузки пользователей:", error);
            if(error.response?.status === 403) alert("У вас нет прав администратора");
        } finally {
            setLoading(false);
        }
    };
    const fetchPoints = async () => {
        setLoading(true);
        try {
            const response = await api.get('/DisposalPoints'); 
            setPoints(response.data);
        } catch (error) {
            console.error("Ошибка загрузки точек:", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/Request/alladmin'); 
            setReports(response.data);
        } catch (error) {
            console.error("Ошибка загрузки отчетов:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }else if (activeTab === 'points'){
            fetchPoints();
        }else if (activeTab === 'reports') {
        fetchReports();
        }
        
    }, [activeTab]);

    const handleEdit = (item) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Вы уверены, что хотите удалить пользователя ${name}?`)) {
            try {
                await api.delete(`/user/admin/delete/${id}`);
                setUsers(users.filter(u => u.id !== id));
                alert("Пользователь удален");
            } catch (error) {
                alert("Ошибка при удалении");
            }
        }
    };

    const handleDeletePoint = async (id) => {
        if (window.confirm(`Удалить точку #${id}?`)) {
            try {
                await api.delete(`/DisposalPoints/${id}`); 
                setPoints(points.filter(p => p.id !== id));
                alert("Точка удалена");
            } catch (error) {
                alert("Ошибка при удалении точки");
            }
        }
    };
    const handleDeleteReport = async (id) => {
        if (window.confirm(`Вы уверены, что хотите удалить отчет #${id}?`)) {
            try {
                await api.delete(`/Request/delete/${id}`); 
                setReports(reports.filter(r => r.id !== id));
                alert("Отчет удален");
            } catch (error) {
                alert("Ошибка при удалении");
            }
        }
    };

    const handleSave = async (updatedUser) => {
        try {
            // Мапим данные под твою модель User на бэкенде
            const payload = {
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                totalPoints: updatedUser.totalPoints 
            };

            await api.put(`/user/admin/update/${updatedUser.id}`, payload);
            
            // Обновляем список локально, чтобы не делать лишний запрос
            setUsers(users.map(u => u.id === updatedUser.id ? { ...u, ...payload } : u));
            setIsEditModalOpen(false);
            alert("Данные обновлены!");
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении");
        }
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
                            <div className={s.tableWrapper}>
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
                                            <td>{u.totalPoints}</td>
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
                        </div>
                    )}
                    {/* 2. ВКЛАДКА ТОЧКИ СБОРА */}
                    {activeTab === 'points' && (
                    <div className={s.card}>
                        <h3>Управление точками на карте</h3>
                        <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    <th>Фото</th>
                                    <th>Тип</th>
                                    <th>Адресс</th>
                                    <th>Координаты</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {points.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            {p.photoUrl ? (
                                                <img src={p.photoUrl} alt="point" className={s.tableImg} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}} />
                                            ) : 'Нет фото'}
                                        </td>
                                        <td>{p.name}</td>
                                        <td>{p.address}</td>
                                        <td>
                                            <small>{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</small>
                                        </td>
                                        <td>
                                            {p.wasteTypes && p.wasteTypes.map((type, idx) => (
                                                <span key={idx} className={s.badge} style={{marginRight: '4px'}}>{type}</span>
                                            ))}
                                        </td>
                                        <td>
                                            <button className={s.deleteBtn} onClick={() => handleDeletePoint(p.id)}>
                                                <i className='bx bx-trash'></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    )}
                    
                    {/* 3. ВКЛАДКА ОТЧЕТЫ */}
                    {activeTab === 'reports' && (
                    <div className={s.card}>
                        <h3>История отправленных отчетов</h3>
                        <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    <th>Фото</th>
                                    <th>От кого</th>
                                    <th>Вес</th>
                                    <th>Тип</th>
                                    <th>Статус</th>
                                    <th>Кометарий</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            {r.photoUrl ? (
                                                <img src={r.photoUrl} alt="report" className={s.tableImg} style={{width: '50px', borderRadius: '4px'}} />
                                            ) : 'Нет фото'}
                                        </td>
                                        <td>{r.userName}</td>
                                        <td>{r.wasteTypeName}</td>
                                        <td>{r.weight}</td>
                                        <td>
                                            <span className={r.status === 'Accepted' || r.status === 'Принят' ? s.statusOk : s.statusWait}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                            {r.comment || "-"}
                                        </td>
                                        <td>
                                            <button className={s.deleteBtn} onClick={() => handleDeleteReport(r.id)}>
                                                <i className='bx bx-trash'></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        {reports.length === 0 && !loading && <p>Отчетов пока нет</p>}
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
                                onChange={(e) => setEditingItem({...editingItem, totalPoints: Number(e.target.value)})}
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