import { io } from 'socket.io-client';

// Available servers based on the new contract (srv-1 on 4000, srv-2 on 4001)
export const SERVERS = [
  { label: 'Server 1', url: 'http://localhost:4000' },
  { label: 'Server 2', url: 'http://localhost:4001' },
];

/**
 * Creates a new Socket.IO client instance for the given server URL.
 * withCredentials: true ensures the 'sid' cookie is sent in the WS handshake.
 */
export function createSocket(serverUrl) {
  return io(serverUrl, {
    autoConnect:    false,
    withCredentials: true,
  });
}
