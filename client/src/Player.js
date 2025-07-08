import Entity from './Entity.js';
import Inventory from './Inventory.js';
import Item from './Item.js';
import Equipment from './Equipment.js';
import InputHandler from './InputHandler.js';

export default class Player extends Entity {
  constructor(id, x, y, stats, scene) {
    super(id, x, y, stats, new InputHandler(scene), true, false);
    this.inventory = new Inventory();
    this.equipment = new Equipment();
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

  static createExamplePlayer(id, x, y, stats, scene) {
    const player = new Player(id, x, y, stats, scene);
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