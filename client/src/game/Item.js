export default class Item {
  constructor({ name, description, slot, stats }) {
    this.name = name;
    this.description = description;
    this.slot = slot; // e.g. 'head', 'body', 'weapon', etc.
    this.stats = stats || {};
  }
} 