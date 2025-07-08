import Item from './Item.js';

export default class Equipment {
  constructor() {
    this.slots = {};
  }

  equipItem(item) {
    if (!(item instanceof Item)) {
      throw new Error('Only Item instances can be equipped');
    }
    this.slots[item.slot] = item;
  }

  unequipItem(slot) {
    delete this.slots[slot];
  }

  getEquippedItems() {
    return { ...this.slots };
  }
} 