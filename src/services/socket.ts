import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket) return socket;
  socket = io(process.env.NEXT_PUBLIC_API_URL  ||'https://negus-gebeya-api.onrender.com', {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
