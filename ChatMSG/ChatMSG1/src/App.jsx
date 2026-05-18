import { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import { socket } from './socket';

export default function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Connect to socket only when needed or automatically if preferred.
    // We configured it with autoConnect: false, so we connect here or on login.
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = (username) => {
    socket.emit('join', username, (response) => {
      if (response.error) {
        alert(response.error); // Simple error handling for now
      } else {
        setCurrentUser(username);
        setIsJoined(true);
      }
    });
  };

  const handleLeave = () => {
    socket.disconnect(); // Disconnect to leave room
    setIsJoined(false);
    setCurrentUser(null);
    socket.connect(); // Reconnect for new login
  };

  return (
    <div className="app-container">
      {!isJoined ? (
        <Login onJoin={handleJoin} />
      ) : (
        <ChatRoom currentUser={currentUser} onLeave={handleLeave} />
      )}
    </div>
  );
}
