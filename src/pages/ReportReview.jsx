import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import s from './ReportReview.module.css';
import api from '../api/axios';

const ReportReview = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const fetchPendingReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/Request/alladmin');
            // Фильтруем только те, что в ожидании
            const pending = response.data.filter(r => r.status === "Pending");
            setReports(pending);
        } catch (error) {
            console.error("Ошибка загрузки:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReports();
    }, []);

    const currentReport = reports[0];

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await api.patch(`/api/Request/${id}/status`, {
                newStatus: newStatus // 1 для Approved, 2 для Rejected (согласно Enum)
            });
            
            alert(response.data.message);
            // Удаляем текущий из списка локально
            setReports(reports.slice(1));
            setIsRejecting(false);
            setRejectReason("");
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении статуса: " + (error.response?.data || "неизвестная ошибка"));
        }
    };

    const handleApprove = () => {
        updateStatus(currentReport.id, 1); // Approved
    };

   const handleReject = () => {
        if (!rejectReason) return alert("Укажите причину отказа");
        updateStatus(currentReport.id, 2); // Rejected
    };
    if (loading) return <div>Загрузка отчетов...</div>;
    return(
        <div className={s.wrapper}>
            <Header />
            <div className={s.container}>
                <div className={s.card}>
                    <h2 className={s.title}>Проверка отчетов</h2>

                    {reports.length > 0 ? (
                        <div className={s.content}>
                            <div className={s.imageBox}>
                                <img src={currentReport.img} alt="report" />
                                <div className={s.typeBadge}>{currentReport.wasteTypeName}</div>
                            </div>

                            <div className={s.info}>
                                <p><strong>Отправитель:</strong> {currentReport.userName}</p>
                                <p><strong>Точка:</strong> {currentReport.pointName}</p>
                                <p><strong>Вес:</strong> {currentReport.weight} кг</p>
                            </div>

                            {!isRejecting ? (
                                <div className={s.actions}>
                                    <button className={s.approveBtn} onClick={handleApprove}>
                                        <i className='bx bx-check'></i> Принять
                                    </button>
                                    <button className={s.rejectBtn} onClick={() => setIsRejecting(true)}>
                                        <i className='bx bx-x'></i> Отклонить
                                    </button>
                                </div>
                            ) : (
                                <div className={s.rejectForm}>
                                    <textarea 
                                        placeholder="Укажите причину отказа..." 
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                    <div className={s.rejectActions}>
                                        <button className={s.sendReject} onClick={handleReject}>Отправить отказ</button>
                                        <button className={s.cancelBtn} onClick={() => setIsRejecting(false)}>Отмена</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={s.emptyState}>
                            <i className='bx bx-wink-smile'></i>
                            <h3>Все отчеты проверены!</h3>
                            <p>На данный момент новых отчетов нет.</p>
                            <button onClick={() => window.location.href='/admin'} className={s.backBtn}>Вернуться в админку</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};
export default ReportReview;