import { useState, useEffect, useRef } from 'react';
import { Send, Users, LogOut, Mail } from 'lucide-react';
import { socket } from '../socket';

export default function ChatRoom({ currentUser, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen for chat history
    socket.on('chatHistory', (history) => {
      setMessages(history);
      scrollToBottom();
    });

    // Listen for new messages
    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for online users
    socket.on('usersList', (users) => {
      setOnlineUsers(users);
    });

    // Listen for join/leave notifications
    socket.on('userJoined', (data) => {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        type: 'system',
        text: `${data.user} joined the chat.`,
        timestamp: data.timestamp
      }]);
    });

    socket.on('userLeft', (data) => {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        type: 'system',
        text: `${data.user} left the chat.`,
        timestamp: data.timestamp
      }]);
    });

    return () => {
      socket.off('chatHistory');
      socket.off('newMessage');
      socket.off('usersList');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, []);

  useEffect(() => {
    // Request initial users list after listeners are set up
    socket.emit('requestUsers');
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit('sendMessage', newMessage, (response) => {
      if (response.error) {
        alert(response.error);
      }
    });

    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="chat-container">
      {/* Sidebar (Mobile Toggle) */}
      <div className={`sidebar ${showUsers ? 'show' : ''}`}>
        <div className="sidebar-header">
          <Users size={20} />
          <h3>Online Users ({onlineUsers.length})</h3>
        </div>
        <ul className="users-list">
          {onlineUsers.map((user, idx) => (
            <li key={idx} className="user-item">
              <div className="status-indicator online"></div>
              <span>{user} {user === currentUser ? '(You)' : ''}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
          <div className="chat-header">
            <div className="header-info">
              <Mail size={24} className="accent-icon" />
              <div className="room-info">
                <h2>Chat</h2>
                <span className="subtitle">{onlineUsers.length} online</span>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="icon-btn mobile-only" 
                onClick={() => setShowUsers(!showUsers)}
                title="Toggle Users"
              >
                <Users size={20} />
              </button>
              <button className="icon-btn danger" onClick={onLeave} title="Leave Chat">
                <LogOut size={20} />
              </button>
            </div>
          </div>

        <div className="messages-area">
          {messages.map((msg) => (
            msg.type === 'system' ? (
              <div key={msg.id} className="system-message">
                <span>{msg.text}</span>
              </div>
            ) : (
              <div 
                key={msg.id} 
                className={`message-wrapper ${msg.user === currentUser ? 'own-message' : ''}`}
              >
                {msg.user !== currentUser && <span className="message-sender">{msg.user}</span>}
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
