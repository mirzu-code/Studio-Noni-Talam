import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatWidget.css';

const quickQuestions = {
  '/': [
    'How do I book a studio class?',
    'What are the class prices?',
    'Which days are classes available?',
    'How do I contact you?'
  ],
  '/tempah-kuih': [
    'What kuih can I order?',
    'What sizes are available?',
    'How do I place an order?'
  ],
  '/product': [
    'What products do you sell?',
    'Do you sell kuih talam?',
    'How do I contact you?'
  ],
  '/learn': [
    'How does the kuih-making game work?',
    'Are there kuih talam tutorials?',
    'How do I book a studio class?'
  ],
  '/checkout': [
    'How do I complete my booking?',
    'How do I send my payment receipt?',
    'How do I contact you?'
  ]
};

const answers = [
  {
    keywords: ['class price', 'package price', 'studio price', 'harga kelas', 'harga pakej'],
    text: 'Studio packages on the website are RM100 for 1 person, RM180 for 2, RM250 for 3, and RM300 for 4 people.'
  },
  {
    keywords: ['schedule', 'time', 'slot', 'available day', 'day', 'open', 'weekend', 'hari', 'waktu', 'jadual'],
    text: 'The Studio page lists sessions Monday to Saturday at 10:00 AM, 11:00 AM, 2:00 PM, 4:00 PM, and 6:00 PM. Availability depends on the date and remaining places shown on the booking form.'
  },
  {
    keywords: ['book', 'booking', 'class', 'studio', 'session', 'tempah kelas'],
    text: 'Choose a studio package, date, and time on the Studio page, then enter your details to continue to checkout. Classes are available Monday to Saturday.'
  },
  {
    keywords: ['capacity', 'full', 'spots', 'per slot', 'remaining places', 'people per', 'how many people', 'orang', 'penuh'],
    text: 'The Studio page allows up to 6 people per time slot and shows remaining places after you choose a date.'
  },
  {
    keywords: ['size', '8x8', '9x9', '10x10', 'saiz'],
    text: 'The kuih ordering page offers 8×8, 9×9, and 10×10 sizes for kuih with size options. The page shows the current price for each kuih and size.'
  },
  {
    keywords: ['pay', 'payment', 'receipt', 'checkout', 'bayar', 'pembayaran'],
    text: 'Continue from your booking or kuih order to the website checkout for payment instructions. For studio bookings, the checkout page asks you to send your receipt through WhatsApp.'
  },
  {
    keywords: ['learn', 'tutorial', 'recipe', 'game', 'belajar', 'video', 'kelas memasak'],
    text: 'The Learn page has tutorials, learning notes, and an interactive six-step kuih talam cooking game. Add or drag ingredients through pandan preparation, the pulut base, steaming, cooling, and cutting until your kuih is ready.'
  },
  {
    keywords: ['order', 'buy', 'delivery', 'pickup', 'pick up', 'kuih', 'menu', 'product', 'produk', 'beli'],
    text: 'You can browse kuih and place an order on the Order Kuih page. The Products page also lists kuih talam, premix, baking equipment, and gift boxes. Delivery details and prices are shown on the order page.'
  },
  {
    keywords: ['contact', 'whatsapp', 'phone', 'number', 'hubungi', 'telefon'],
    text: 'You can contact Studio Noni Talam on WhatsApp at 018-316 8944.'
  }
];

const getAnswer = (question) => {
  const normalized = question.toLowerCase();
  const match = answers.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );

  return match?.text || 'I can only answer using information on this website. Try asking about studio bookings, kuih orders, products, or tutorials. For anything else, contact us on WhatsApp at 018-316 8944.';
};

const ChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const questions = quickQuestions[location.pathname] || quickQuestions['/'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (text) => {
    const question = text.trim();
    if (!question) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { type: 'user', text: question },
      { type: 'bot', text: getAnswer(question) }
    ]);
    setMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(message);
  };

  return (
    <>
      <button
        className="chat-widget-button"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close chat' : 'Open chat with the kuih assistant'}
        aria-expanded={isOpen}
      >
        <iframe
          className="mascot-frame"
          src="/kuih_3d.html?bare=1"
          title="Animated kuih mascot"
          tabIndex="-1"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <section className="chat-window" aria-label="Noni Talam website assistant">
          <header className="chat-header">
            <div className="chat-brand">
              <span className="chat-brand-icon" aria-hidden="true">✦</span>
              <div>
                <h2>Noni Talam</h2>
                <p>Website guide</p>
              </div>
            </div>
            <button
              className="close-btn"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <span className="welcome-sparkle" aria-hidden="true">✦</span>
                <h3>Good to see you.</h3>
                <p>Ask me about our studio classes, kuih, or products.</p>
              </div>
            )}
            {messages.map((item, index) => (
              <div key={`${index}-${item.type}`} className={`message ${item.type}`}>
                {item.type === 'bot' && <span className="bot-avatar" aria-hidden="true">✦</span>}
                <div className="message-text">{item.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="quick-questions" aria-label="Suggested questions">
              {questions.map((question) => (
                <button
                  key={question}
                  className="question-btn"
                  type="button"
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              placeholder="Ask about classes, kuih, or products"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="chat-input"
              maxLength={300}
              aria-label="Your question"
            />
            <button type="submit" className="send-btn" aria-label="Send message" disabled={!message.trim()}>
              ↑
            </button>
          </form>

          <p className="chat-footer">Answers are based on information on this website.</p>
        </section>
      )}
    </>
  );
};

export default ChatWidget;
