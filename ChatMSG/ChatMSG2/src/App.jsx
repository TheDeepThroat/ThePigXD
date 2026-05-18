import { useState } from 'react';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import { createSocket } from './socket';

export default function App() {
  const [isJoined,    setIsJoined]    = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket,      setSocket]      = useState(null);
  const [serverUrl,   setServerUrl]   = useState(null);
  const [serverLabel, setServerLabel] = useState(null);

  /**
   * Called by Login after a successful POST /api/login.
   * The HttpOnly cookie is already set by the server at this point.
   * We create the socket (which will send the cookie in its handshake) and connect.
   */
  const handleJoin = (username, url, label) => {
    const newSocket = createSocket(url);
    newSocket.connect();

    setSocket(newSocket);
    setCurrentUser(username);
    setServerUrl(url);
    setServerLabel(label);
    setIsJoined(true);
  };

  const handleLeave = async () => {
    // Disconnect the socket first (triggers server-side disconnect event)
    if (socket) {
      socket.disconnect();
      socket.removeAllListeners();
    }

    // Clear the HttpOnly cookie via the logout endpoint
    if (serverUrl) {
      try {
        await fetch(`${serverUrl}/logout`, {
          method:      'POST',
          credentials: 'include',
        });
      } catch {
        // Ignore network errors on logout
      }
    }

    setSocket(null);
    setIsJoined(false);
    setCurrentUser(null);
    setServerUrl(null);
    setServerLabel(null);
  };

  return (
    <div className="app-container">
      {!isJoined ? (
        <Login onJoin={handleJoin} />
      ) : (
        <ChatRoom
          currentUser={currentUser}
          onLeave={handleLeave}
          socket={socket}
          serverLabel={serverLabel}
          serverUrl={serverUrl}
        />
      )}
    </div>
  );
}
