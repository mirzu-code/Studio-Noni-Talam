import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatWidget.css';

const ChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [animationState, setAnimationState] = useState('wave'); // wave, eating, idle, clicked
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Page-specific questions
  const pageQuestions = {
    '/': [
      'Pukul berapa sesi bermula?',
      'Adakah slot penuh?',
      'Berapa harga per orang?',
      'Boleh buku untuk berapa ramai?'
    ],
    '/checkout': [
      'Kaedah pembayaran apa tersedia?',
      'Bagaimana jika saya tak boleh hadir?',
      'Berapa lama sesi?',
      'Adakah tempat letak kereta?'
    ],
    '/admin': [
      'Bagaimana untuk melihat semua tempahan?',
      'Boleh ubah booking pelanggan?'
    ]
  };

  const pageGreetings = {
    '/': 'Assalamualaikum! 👋 Ada soalan tentang sesi kuih talam kami?',
    '/checkout': 'Assalamualaikum! 💚 Ada soalan tentang pembayaran?',
    '/admin': 'Selamat datang Admin! 📊 Ada yang boleh saya bantu?'
  };

  const currentQuestions = pageQuestions[location.pathname] || pageQuestions['/'];
  const currentGreeting = pageGreetings[location.pathname] || pageGreetings['/'];

  // Initialize messages when page changes
  useEffect(() => {
    setMessages([
      {
        type: 'bot',
        text: currentGreeting
      }
    ]);
  }, [location.pathname]);

  // Cycle through animations
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState(prev => {
        const states = ['wave', 'idle', 'eating', 'idle'];
        const currentIndex = states.indexOf(prev);
        return states[(currentIndex + 1) % states.length];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleWidgetClick = () => {
    setIsOpen(!isOpen);
    setAnimationState('clicked');
    setTimeout(() => setAnimationState('wave'), 600);
  };

  const handleQuestionClick = (question) => {
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: question }]);
    setMessage('');
    setAnimationState('eating');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Terima kasih atas pertanyaan anda! Sila hubungi kami di WhatsApp 018-316 8944 untuk jawapan yang lebih detail. 😊'
      }]);
      setAnimationState('wave');
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: message }]);
    setMessage('');
    setAnimationState('eating');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Terima kasih atas pertanyaan anda! Sila hubungi kami di WhatsApp 018-316 8944 untuk jawapan yang lebih detail. 😊'
      }]);
      setAnimationState('wave');
    }, 1500);
  };

  return (
    <>
      {/* Floating Chat Button - Character as Icon */}
      <div 
        className="chat-widget-button"
        onClick={handleWidgetClick}
        title="Klik untuk membuka soalan & jawapan"
      >
        <div className={`kuih-character ${animationState}`}>
          <img 
            src="/kuih-character.png" 
            alt="Kuih Talam Chat" 
            className="character-sprite"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="fallback-icon" style={{ display: 'none' }}>
            🍵
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window animate-slide-up">
          <div className="chat-header">
            <h3>💬 Tanya Kami!</h3>
            <button 
              className="close-btn" 
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                {msg.type === 'bot' && <span className="bot-avatar">🍵</span>}
                <div className="message-text">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Question Buttons */}
          <div className="quick-questions">
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0', fontWeight: 500 }}>
              Pertanyaan Popular:
            </p>
            <div className="questions-grid">
              {currentQuestions.map((question, idx) => (
                <button
                  key={idx}
                  className="question-btn"
                  onClick={() => handleQuestionClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              placeholder="Tulis soalan anda..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="chat-input"
              maxLength="150"
            />
            <button type="submit" className="send-btn">Hantar</button>
          </form>

          <div className="chat-footer">
            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              💚 Layanan pelanggan · Isnin-Sabtu: 10:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
