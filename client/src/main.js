import { Game, AUTO } from 'phaser';
import MainScene from './scenes/MainScene.js';

const config = {
  type: AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222',
  scene: MainScene,
  parent: 'app',
};

new Game(config); 