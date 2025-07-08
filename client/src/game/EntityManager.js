export default class EntityManager {
  constructor() {
    this.entities = {};
  }

  addEntity(entity) {
    this.entities[entity.id] = entity;
  }

  removeEntity(id) {
    delete this.entities[id];
  }

  getEntity(id) {
    return this.entities[id];
  }

  getAllEntities() {
    return Object.values(this.entities);
  }

  updateAll(scene) {
    for (const entity of this.getAllEntities()) {
      if (typeof entity.update === 'function') {
        entity.update(scene);
      }
    }
  }
} 