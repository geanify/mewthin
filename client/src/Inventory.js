import Item from './Item.js';

export default class Inventory {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    if (item instanceof Item) {
      this.items.push(item);
    } else {
      throw new Error('Only Item instances can be added to inventory');
    }
  }

  removeItem(item) {
    const idx = this.items.indexOf(item);
    if (idx !== -1) {
      this.items.splice(idx, 1);
    }
  }

  getItems() {
    return this.items;
  }
} 