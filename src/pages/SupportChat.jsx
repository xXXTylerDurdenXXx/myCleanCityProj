import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import s from './SupportChat.module.css';
import { useNavigate } from 'react-router-dom'; 
import api from '../api/axios';
import * as signalR from '@microsoft/signalr';

const getCurrentTime = () => {
    const now = new Date();
    return now.getHours() + ":" + now.getMinutes().toString().padStart(2, '0');
  };
  
const SupportChat = () => {
  // 1. Храним массив сообщений в стейте
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Привет! Я Робот-помощник. Чем могу помочь?", 
      sender: "bot", 
      time: getCurrentTime() 
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [chatId, setChatId] = useState(null); 
  const messagesEndRef = useRef(null);
  const [moderatorCalled, setModeratorCalled] = useState(false);
  const connectionRef = useRef(null);

  useEffect(() => {
    api.get('/Chat/my-chat').then(res => setChatId(res.data.chatId));
  }, []);

  useEffect(() => {
         const connection = new signalR.HubConnectionBuilder()
          .withUrl("http://192.168.1.244:5000/supportChat", {
              accessTokenFactory: () => localStorage.getItem("token")
          })
          .withAutomaticReconnect()
          .build();

      connection.on("ReceiveMessage", (message) => {

          if (message.chatId !== chatId) return;

          setMessages(prev => [...prev, {
              id: Date.now(),
              text: message.text,
              sender: message.isSupportReply ? "bot" : "user",
              time: getCurrentTime()
          }]);

          if (message.isSupportReply) {
              setModeratorCalled(true);
          }
      });
      connection.on("ChatClosed", () => {

          addBotMessage(
              "Диалог завершён оператором"
          );

          setModeratorCalled(false);
      });

      const startConnection = async () => {

          try {

              await connection.start();

              connectionRef.current = connection;

              console.log("SignalR connected");

          } catch (err) {
              console.error(err);
          }
      };

      startConnection();

      return () => {
          connection.stop();
      };

  }, [chatId]);

  

  const categories = [
    { id: 1, text: "Не работает точка", icon: "bx-block", action: "call" },
    { id: 2, text: "Оборудование", icon: "bx-wrench", action: "call" },
    { id: 3, text: "Не начисляются баллы", icon: "bx-credit-card", action: "info" },
    { id: 4, text: "Личный кабинет", icon: "bx-user", action: "info" },
  ];


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
    

  const notifyModerator = async () => {
    if (!chatId) return;
    if (moderatorCalled) return;

    try {
      await api.post('/Chat/call-moderator', chatId, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
      setModeratorCalled(true);

      addBotMessage("Оператор подключается к чату, пожалуйста, подождите...");
    } catch (e) {
      console.error("Ошибка вызова модератора", e);
    }
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      text: text,
      sender: "bot",
      time: getCurrentTime()
    }]);
  };

  // Функция отправки сообщения
  const sendMessage = async (
      text,
      isCategory = false,
      categoryAction = null
  ) => {

      if (!text.trim()) return;

      setInputValue("");

      try {

          if (connectionRef.current) {

              await connectionRef.current.invoke(
                  "SendMessage",
                  chatId,
                  text
              );
          }

      } catch (err) {
          console.error(err);
      }

      if (moderatorCalled) {
          return;
      }

      setTimeout(async () => {

          if (isCategory) {

              if (categoryAction === "call") {

                  addBotMessage("Передаю ваш запрос оператору...");

                  await notifyModerator();

                  return;
              }

              const replies = {

                  "Не начисляются баллы":
                      "Похоже, заявка ещё обрабатывается.",

                  "Личный кабинет":
                      "Настройки доступны в профиле."
              };

              if (replies[text]) {

                  addBotMessage(replies[text]);

              } else {

                  addBotMessage("Передаю оператору...");

                  await notifyModerator();
              }

          } else {

              addBotMessage(
                  "Передаю ваш вопрос оператору..."
              );

              await notifyModerator();
          }

      }, 600);
  };

  const handleCategoryClick = (category) => {
    sendMessage(category.text, true, category.action);
  };

  const handleManualSend = () => sendMessage(inputValue);

 return (
    <div className={s.chatWrapper}>
      <div className={s.chatHeader}>
        <span>Поддержка "Чистый город"</span>
        <button className={s.chatClose}><i className='bx bx-x'></i></button>
      </div>
        {moderatorCalled && (
          <div className={s.moderatorBanner}>
            Оператор подключён
          </div>
        )}

      <div className={s.chatMessages}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${s.message} ${msg.sender === 'bot' ? s.bot : s.user}`}>
            {msg.sender === 'bot' && (
              <div className={s.botAvatar}>
                <img src="/Resources/robot.png" alt="Robot" />
              </div>
            )}
            <div className={s.messageContent}>
              <p>{msg.text}</p>
              <span className={s.time}>{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ПЛАШКИ КАТЕГОРИЙ */}
      <div className={s.chatCategories}>
        {categories.map(cat => (
          <button 
            key={cat.id} 
            className={s.categoryPill}
            onClick={() => handleCategoryClick(cat)} 
          >
            <i className={`bx ${cat.icon}`}></i> {cat.text}
          </button>
        ))}
      </div>

      <div className={s.chatInputArea}>
        <button className={s.attachBtn}><i className='bx bx-paperclip'></i></button>
        <input 
          type="text" 
          placeholder="Напишите сообщение..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
        />
        <button className={s.sendBtn} onClick={handleManualSend}>
          <i className='bx bxs-send'></i>
        </button>
      </div>
    </div>
  );
};

export default SupportChat;