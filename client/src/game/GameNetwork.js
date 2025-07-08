import socket from './socket.js';
import Entity from './Entity.js';
import Player from './Player.js';
import Enemy from './Enemy.js';

export default class GameNetwork {
  constructor(entityManager, setPlayerIdCb, drawEntitiesCb, scene) {
    this.entityManager = entityManager;
    this.setPlayerId = setPlayerIdCb;
    this.drawEntities = drawEntitiesCb;
    this.scene = scene;

    // Remove previous socket listeners to avoid duplicates on hot reload
    socket.off('currentState');
    socket.off('entityUpdated');
    socket.off('entityMoved');
    socket.off('entityLeft');

    socket.on('currentState', ({ entities, playerId }) => {
      // Remove all entities not in the new state
      const currentIds = new Set(Object.keys(entities));
      this.entityManager.getAllEntities().forEach(entity => {
        if (!currentIds.has(entity.id)) {
          this.entityManager.removeEntity(entity.id);
        }
      });

      // Add or update entities from the server
      Object.entries(entities).forEach(([id, data]) => {
        let entity = this.entityManager.getEntity(id);
        if (!entity) {
          if (data.isPlayer) {
            entity = new Player(id, data.x, data.y, data.stats, this.scene);
          } else if (data.isEnemy) {
            entity = new Enemy(id, data.x, data.y, data.stats);
          } else {
            entity = new Entity(id, data.x, data.y, data.stats, null);
          }
          this.entityManager.addEntity(entity);
        } else {
          entity.updatePosition(data.x, data.y);
          entity.updateStats(data.stats);
        }
      });

      this.setPlayerId(playerId);
      this.drawEntities();
    });

    socket.on('entityMoved', ({ id, x, y, stats }) => {
      let entity = this.entityManager.getEntity(id);
      if (entity) {
        entity.updatePosition(x, y);
        entity.updateStats(stats);
        this.drawEntities();
      }
    });

    socket.on('entityUpdated', (data) => {
      let entity = this.entityManager.getEntity(data.id);
      if (!entity) {
        // Add new entity (Player or Enemy)
        if (data.isPlayer) {
          entity = new Player(data.id, data.x, data.y, data.stats, this.scene);
        } else if (data.isEnemy) {
          entity = new Enemy(data.id, data.x, data.y, data.stats);
        } else {
          entity = new Entity(data.id, data.x, data.y, data.stats, null);
        }
        this.entityManager.addEntity(entity);
      } else {
        entity.updatePosition(data.x, data.y);
        entity.updateStats(data.stats);
      }
      this.drawEntities();
    });

    socket.on('entityLeft', (id) => {
      this.entityManager.removeEntity(id);
      this.drawEntities();
    });
  }
} 