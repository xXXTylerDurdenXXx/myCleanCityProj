import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import api from '../api/axios';
import Header from '../components/Header';
import s from './ModeratorChat.module.css';

const ModeratorChat = () => {
    const [chats, setChats] = useState([]); // Список только активных вызовов
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const connectionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const activeChatIdRef = useRef(null);

    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    // Загрузка уже существующих "вызовов" при входе
    useEffect(() => {
        const fetchActive = async () => {
            try {
                const response = await api.get('/Chat/active-requests');
                setChats(response.data); 
            } catch (e) {
                console.error("Ошибка загрузки активных заявок", e);
            }
        };
        fetchActive();
    }, []);
   

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);



    // Подключение к SignalR
    useEffect(() => {

        let isMounted = true;

        const connect = new signalR.HubConnectionBuilder()
            .withUrl("http://89.108.66.220:5000/supportChat", {
                accessTokenFactory: () => localStorage.getItem("token")
            })
            .withAutomaticReconnect()
            .build();
            
            const refreshChats = async () => {
                try {
                    const response = await api.get('/Chat/active-requests');
                    setChats(response.data);
                } catch (e) {
                    console.error(e);
                }
            };
        
           const startConnection = async () => {

                try {

                    connect.on("NewSupportRequest", () => {
                        refreshChats();
                    });

                    connect.on("ReceiveMessage", (message) => {

                        const formatted = {
                            senderId: message.senderId,
                            text: message.text,
                            time: message.createdAt,
                            isSupportReply: message.isSupportReply
                        };

                        if (
                            message.chatId?.toLowerCase() ===
                            activeChatIdRef.current?.toLowerCase()
                        ) {
                            setMessages(prev => [...prev, formatted]);
                        }

                        refreshChats();
                    });
                    connect.on("ChatClosed", (chatId) => {

                        setChats(prev =>
                            prev.filter(c => c.id !== chatId)
                        );

                        if (
                            activeChatIdRef.current?.toLowerCase() ===
                            chatId.toLowerCase()
                        ) { 

                            setMessages([]);

                            setActiveChatId(null);
                        }
                    });

                    if (!isMounted) return;

                    await connect.start();

                    connectionRef.current = connect;

                    console.log("SignalR Connected");

                    await connect.invoke("JoinModeratorGroup");

                } catch (err) {
                    console.error("SignalR Error:", err);
                }
            };

        startConnection();
        

        return () => {

            isMounted = false;

            connect.off("ReceiveMessage");
            connect.off("NewSupportRequest");
            connect.off("ChatClosed");

            if (connect.state === signalR.HubConnectionState.Connected) {

                connect.stop()
                    .catch(err => console.error(err));
            }
        };
    }, []);

    const handleChatSelect = async (chatId) => {
        setActiveChatId(chatId); 
        setMessages([]); 

        try {
            const response = await api.get(`/Chat/${chatId}/messages`);
            
            const history = response.data.map(m => ({
                text: m.text,
                senderId: m.senderId,
                time: m.createdAt,
                isSupportReply: m.isSupportReply
            }));
            
            setMessages(history);
        } catch (err) {
            console.error("Не удалось загрузить историю сообщений:", err);
        }
    };

    // Отправка ответа
    const handleSend = async () => {

        if (!inputValue.trim()) return;
        if (!activeChatId) return;
        if (!connectionRef.current) return;

        try {

            await connectionRef.current.invoke(
                "SendMessage",
                activeChatId,
                inputValue
            );

            setInputValue("");

        } catch (err) {
            console.error(err);
        }
    };
    const handleCloseChat = async () => {

        if (!activeChatId) return;

        try {

            await api.post(
                '/Chat/close-chat',
                activeChatId,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // удалить чат из списка
            setChats(prev =>
                prev.filter(c => c.id !== activeChatId)
            );

            // очистить окно
            setMessages([]);

            // снять активный чат
            setActiveChatId(null);

        } catch (err) {

            console.error("Ошибка закрытия чата", err);
        }
    };

    return (
        <div className={s.pageWrapper}>
            <Header />
            <div className={s.wrapper}>

            <div className={s.sidebar}>

                <div className={s.sidebarHeader}>
                    Поддержка
                </div>

                <div className={s.chatList}>
                    {chats.map(chat => (

                        <div
                            key={chat.id}
                            className={`${s.chatItem} ${activeChatId === chat.id ? s.active : ''}`}
                            onClick={() => handleChatSelect(chat.id)}
                        >

                            <div className={s.chatTop}>
                                <span className={s.chatName}>
                                    {chat.name}
                                </span>
                            </div>

                            <div className={s.chatBottom}>
                                ID: {chat.id.slice(0, 8)}
                            </div>

                        </div>

                    ))}
                </div>

            </div>

            {/* CHAT */}

            <div className={s.chatSection}>

                {!activeChatId ? (

                    <div className={s.empty}>
                        Выберите чат
                    </div>

                ) : (

                    <>
                        <div className={s.chatHeader}>
                            <span>
                                Чат #{activeChatId.slice(0, 8)}
                            </span>

                            <button
                                className={s.closeChatBtn}
                                onClick={handleCloseChat}
                            >
                                Завершить диалог
                            </button>
                        </div>

                        <div className={s.messages}>

                            {messages.map((m, index) => (

                                <div
                                    key={index}
                                    className={
                                        m.isSupportReply
                                            ? s.supportMessage
                                            : s.userMessage
                                    }
                                >
                                    <div className={s.messageText}>
                                        {m.text}
                                    </div>

                                    <div className={s.messageTime}>
                                        {new Date(m.time).toLocaleTimeString([],{
                                             hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                            ))}

                            <div ref={messagesEndRef} />

                        </div>

                        <div className={s.inputArea}>

                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSend()
                                }
                                placeholder="Введите сообщение..."
                            />

                            <button onClick={handleSend}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L11 13" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                        </div>
                    </>
                )}

            </div>

            </div>
        </div>
    );
};

export default ModeratorChat;