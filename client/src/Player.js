import socket from './socket.js';
import Inventory from './Inventory.js';
import Item from './Item.js';
import Equipment from './Equipment.js';

export default class Player {
  constructor(id, x, y, stats) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.stats = stats || {};
    this.currentHealth = this.stats.currentHealth || this.stats.baseHP || 100;
    this.range = this.stats.range || 1.5;
    this.inventory = new Inventory();
    this.equipment = new Equipment();
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  updateStats(stats) {
    this.stats = stats;
    this.currentHealth = this.stats.currentHealth || this.stats.baseHP || 100;
    this.range = this.stats.range || 1.5;
  }

  update(scene) {
    // Only update if this is the local player
    if (this.id !== scene.playerId) return;
    const speed = (this.stats && this.stats.movementSpeed) ? this.stats.movementSpeed : 2;
    const dir = scene.inputHandler.getDirection();
    let moved = false;
    if (dir.left) {
      this.x -= speed;
      moved = true;
    }
    if (dir.right) {
      this.x += speed;
      moved = true;
    }
    if (dir.up) {
      this.y -= speed;
      moved = true;
    }
    if (dir.down) {
      this.y += speed;
      moved = true;
    }
    if (moved) {
      socket.emit('move', { x: this.x, y: this.y });
      scene.drawPlayers();
    }
  }

  equipItem(item) {
    this.equipment.equipItem(item);
  }

  unequipItem(slot) {
    this.equipment.unequipItem(slot);
  }

  getEquippedItems() {
    return this.equipment.getEquippedItems();
  }

  static createExamplePlayer(id, x, y, stats) {
    const player = new Player(id, x, y, stats);
    // Example items
    const sword = new Item({
      name: 'Sword',
      description: 'A sharp blade.',
      slot: 'weapon',
      stats: { attack: 5 }
    });
    const helmet = new Item({
      name: 'Helmet',
      description: 'Protects your head.',
      slot: 'head',
      stats: { defense: 2 }
    });
    player.inventory.addItem(sword);
    player.inventory.addItem(helmet);
    return player;
  }
} 