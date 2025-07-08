import io from 'socket.io-client';

if (!window.socket) {
  window.socket = io('http://localhost:21234');
}

export default window.socket; 