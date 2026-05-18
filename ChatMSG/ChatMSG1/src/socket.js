import { io } from 'socket.io-client';

// 'http://localhost:3000' is the backend url we set up
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: false, // Don't connect immediately, wait for login
});
