import React, { useState } from 'react';
import Header from '../components/Header';
import s from './ReportReview.module.css';

const ReportReview = () => {
    // Имитация данных из БД
    const [reports, setReports] = useState([
        { id: 1, user: "Иван Иванов", type: "Пластик", points: 50, img: '/Resources/avatar.png' },
        { id: 2, user: "Анна Смирнова", type: "Стекло", points: 30, img: "https://images.unsplash.com/photo-1533234427049-9e9bb093186d?auto=format&fit=crop&w=500" }
    ]);

    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const currentReport = reports[0]; // Берем первый отчет из очереди

    const handleApprove = () => {
        alert(`Принято! Пользователю ${currentReport.user} начислено ${currentReport.points} баллов.`);
        setReports(reports.slice(1)); // Убираем текущий отчет из списка
    };

    const handleReject = () => {
        if (!rejectReason) return alert("Укажите причину отказа");
        alert(`Отклонено. Причина: ${rejectReason}`);
        setReports(reports.slice(1));
        setIsRejecting(false);
        setRejectReason("");
    };
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
                                <div className={s.typeBadge}>{currentReport.type}</div>
                            </div>

                            <div className={s.info}>
                                <p><strong>Отправитель:</strong> {currentReport.user}</p>
                                <p><strong>Будет начислено:</strong> <span className={s.points}>+{currentReport.points} баллов</span></p>
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
                            <i className='bx bx-party'></i>
                            <h3>Все отчеты проверены!</h3>
                            <p>На данный момент новых заявок нет.</p>
                            <button onClick={() => window.location.href='/admin'} className={s.backBtn}>Вернуться в админку</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};
export default ReportReview;