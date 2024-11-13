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
let isJumping = false;
let ground;
let speed = 3; // How fast the ground moves to the left
let groundWidth;
let block;

const game = new Phaser.Game(config);
function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('ground', 'assets/ground.png');
  this.load.image('block', 'assets/block.webp');
}

function create() {
  player = this.physics.add.image(128, 650, 'player');
  player.setDisplaySize(64, 64);
  this.input.on('pointerdown', jump, this);

  groundWidth = 125;
  ground = this.physics.add.group();
  for (let i = 0; i < 10; i++) {
    let tile = this.add.tileSprite(i * 125, 720, 148, 125, 'ground');
    ground.add(tile);
  }
  this.physics.add.collider(
    player,
    ground,
    handlePlayerGroundCollision,
    null,
    this
  );

  block = this.physics.add.image(800, 560, 'block');
  block.setDisplaySize(64, 64);

  this.physics.add.collider(
    player,
    block,
    handlePlayerBlockCollision,
    null,
    this
  );
}

function handlePlayerGroundCollision(player, tile) {
  player.y = 625;
}
function handlePlayerBlockCollision(player, block) {
  player.y = block.y - 64;
}
function jump() {
  if (isJumping) return;
  // Prevent starting multiple jumps at once

  isJumping = true; // Set flag to prevent multiple clicks

  // Create jump and spin animations using tweens
  this.tweens.add({
    targets: player,
    y: player.y - 128, // Jump to double its height
    rotation: '+=' + Phaser.Math.DegToRad(90), // Rotate 720 degrees (2 full spins)
    ease: 'Quad.easeOut',
    duration: 200, // Duration of the jump (upwards motion)
    onComplete: () => {
      // Now apply the gravity fall after the upward jump
      this.tweens.add({
        targets: player,
        y: player.y + 128, // Return to original Y position
        rotation: '+=' + Phaser.Math.DegToRad(90),
        ease: 'Quad.easeIn',
        duration: 200, // Duration of the fall (downwards motion)
        onComplete: () => {
          isJumping = false; // Reset jumping flag after complete fall
          if (this.input.activePointer.isDown) {
            jump.call(this); // Start the next jump
          }
        },
      });
    },
  });
}

function update() {
  block.x -= speed;
  ground.getChildren().forEach((tile) => {
    tile.x -= speed;

    // If a tile moves off-screen to the left, reset its position to the right
    if (tile.x + groundWidth < 0) {
      tile.x = ground.getChildren().length * groundWidth - groundWidth;
    }
  });
}
