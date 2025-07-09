export default class InventoryUI {
  constructor(scene, getPlayer) {
    this.scene = scene;
    this.getPlayer = getPlayer;
    this.gridCols = 4;
    this.gridRows = 5;
    this.cellSize = 48;
    this.margin = 16;
    this.originX = scene.scale.width - (this.gridCols * this.cellSize) - this.margin;
    this.originY = scene.scale.height - (this.gridRows * this.cellSize) - this.margin;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(100);
    this.texts = [];
  }

  update() {
    // Clear previous graphics and texts
    this.graphics.clear();
    this.texts.forEach(t => t.destroy());
    this.texts = [];

    // Draw grid
    this.graphics.lineStyle(2, 0x888888, 1);
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const x = this.originX + col * this.cellSize;
        const y = this.originY + row * this.cellSize;
        this.graphics.strokeRect(x, y, this.cellSize, this.cellSize);
      }
    }

    // Draw items
    const player = this.getPlayer();
    if (!player || !player.inventory) return;
    const items = player.inventory.getItems();
    for (let i = 0; i < items.length && i < this.gridCols * this.gridRows; i++) {
      const item = items[i];
      const col = i % this.gridCols;
      const row = Math.floor(i / this.gridCols);
      const x = this.originX + col * this.cellSize + 4;
      const y = this.originY + row * this.cellSize + 4;
      const text = this.scene.add.text(x, y, item.name, { font: '14px Arial', fill: '#fff', wordWrap: { width: this.cellSize - 8 } });
      this.texts.push(text);
    }
  }

  destroy() {
    this.graphics.destroy();
    this.texts.forEach(t => t.destroy());
    this.texts = [];
  }
} 