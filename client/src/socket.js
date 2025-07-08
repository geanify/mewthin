import io from 'socket.io-client';

if (!window?.socket) {
  window.socket = io('ws://localhost:21234');
}

export default window.socket; 