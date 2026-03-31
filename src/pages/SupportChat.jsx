import React, { useState, useEffect, useRef } from 'react';
import s from './SupportChat.module.css';

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
  const messagesEndRef = useRef(null); 

  const categories = [
    { id: 1, text: "Не работает точка", icon: "bx-block" },
    { id: 2, text: "Оборудование", icon: "bx-wrench" },
    { id: 3, text: "Баллы и оплата", icon: "bx-credit-card" },
    { id: 4, text: "Личный кабинет", icon: "bx-user" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  

  // 2. Функция отправки сообщения
  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: text,
      sender: "user",
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // 3. Имитация ответа бота
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        text: "Ваше сообщение передано модератору системы «Чистый город». Ожидайте ответа.",
        sender: "bot",
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, botReply]);
    }, 1000);
  };

  const handleManualSend = () => {
    sendMessage(inputValue);
    setInputValue("");
  };

 return (
    <div className={s.chatWrapper}>
      <div className={s.chatHeader}>
        <span>Поддержка "Чистый город"</span>
        <button className={s.chatClose}><i className='bx bx-x'></i></button>
      </div>

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
            onClick={() => sendMessage(cat.text)} 
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