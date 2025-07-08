import socket from './socket.js';

export default class GameNetwork {
  constructor(entityManager, Player, Enemy, setPlayerIdCb, drawPlayersCb) {
    this.entityManager = entityManager;
    this.Player = Player;
    this.Enemy = Enemy;
    this.setPlayerId = setPlayerIdCb;
    this.drawPlayers = drawPlayersCb;

    // Remove previous socket listeners to avoid duplicates on hot reload
    socket.off('currentState');
    socket.off('playerJoined');
    socket.off('playerMoved');
    socket.off('playerLeft');

    socket.on('currentState', ({ players, enemies }) => {
      // Remove all non-enemy entities
      this.entityManager.getAllEntities().forEach(entity => {
        if (!entity.isEnemy) {
          this.entityManager.removeEntity(entity.id);
        }
      });

      // Add or update players from the server
      Object.entries(players).forEach(([id, data]) => {
        let player = this.entityManager.getEntity(id);
        if (player && !player.isEnemy) {
          player.updatePosition(data.x, data.y);
          player.updateStats(data.stats);
        } else if (!player) {
          this.entityManager.addEntity(new this.Player(id, data.x, data.y, data.stats));
        }
      });

      // Add or update enemies from the server
      Object.entries(enemies).forEach(([id, data]) => {
        let enemy = this.entityManager.getEntity(id);
        if (!enemy) {
          this.entityManager.addEntity(new this.Enemy(id, data.x, data.y, data.stats));
        } else {
          enemy.x = data.x;
          enemy.y = data.y;
          enemy.stats = data.stats;
        }
      });

      this.setPlayerId(socket.id);
      this.drawPlayers();
      // Log stats for debugging
      this.entityManager.getAllEntities().forEach((entity) => {
        if (!entity.isEnemy) {
          console.log(`Player ${entity.id} stats:`, entity.stats);
        }
      });
    });
  }
} 