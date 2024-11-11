const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  background: '#191970',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
let player;

const game = new Phaser.Game(config);
function preload() {
  this.load.image('player', 'assets/player.webp');
}

function create() {
  player = this.physics.add.image(0, 500, 'player');
}
function update() {}
