import React, { useState, useEffect } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [animationState, setAnimationState] = useState('wave'); // wave, eating, idle, clicked
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Assalamualaikum! 👋 Ada soalan tentang sesi kuih talam kami? Saya di sini untuk membantu!'
    }
  ]);

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages([...messages, { type: 'user', text: message }]);
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
      {/* Floating Chat Button */}
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
          />
        </div>
        <span className="chat-badge">?</span>
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
