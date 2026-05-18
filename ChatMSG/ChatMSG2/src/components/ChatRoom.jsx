import { useState, useEffect, useRef } from 'react';
import { Send, LogOut, Mail, Wifi } from 'lucide-react';

export default function ChatRoom({ currentUser, onLeave, socket, serverLabel, serverUrl }) {
  const [messages,   setMessages]  = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected,  setConnected]  = useState(socket?.connected ?? false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    
    // The new contract emits "hello" on connection
    const onHello = (data) => console.log('Connected to server:', data.server);

    // The new contract emits "message" for all chat messages
    const onMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('hello',      onHello);
    socket.on('message',    onMessage);

    // Fetch initial history from the HTTP endpoint as per contract
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${serverUrl}/messages`, { credentials: 'include' });
        if (res.ok) {
          const history = await res.json();
          setMessages(history);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };

    fetchHistory();

    return () => {
      socket.off('connect',    onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('hello',      onHello);
      socket.off('message',    onMessage);
    };
  }, [socket]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    // The new contract expects event "message" with { text }
    socket.emit('message', { text: newMessage.trim() });
    setNewMessage('');
  };

  const formatTime = (timestamp) =>
    new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));

  return (
    <div className="chat-container">
      {/* Main Chat */}
      <div className="main-chat">
        <div className="chat-header">
          <div className="header-info">
            <Mail size={24} className="accent-icon" />
            <div className="room-info">
              <h2>Global Room</h2>
              <span className="subtitle">{serverLabel}</span>
            </div>
          </div>

          <div className={`server-badge ${connected ? 'connected' : 'disconnected'}`}>
            <Wifi size={12} />
            <span>{connected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          <div className="header-actions">
            <button className="icon-btn danger" onClick={onLeave} title="Leave Chat">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="messages-area">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-wrapper ${msg.username === currentUser ? 'own-message' : ''}`}
            >
              {msg.username !== currentUser && (
                <span className="message-sender">{msg.username} <small>({msg.origin})</small></span>
              )}
              <div className="message-bubble">
                <p>{msg.text}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
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
            disabled={!connected}
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim() || !connected}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
