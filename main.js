const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  background: '#191970',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 6400 },
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
let background;
let speed = 5; // How fast the ground moves to the left
let groundWidth;
let bgWidth;
let blocks;
let spikes;

const game = new Phaser.Game(config);
function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('ground', 'assets/ground.png');
  this.load.image('block', 'assets/block.webp');
  this.load.image('spike', 'assets/spike.png');
  this.load.image('background', 'assets/background.jpg');
}

function create() {
  player = this.physics.add.image(128, 650, 'player');
  player.setDisplaySize(64, 64);
  this.input.on('pointerdown', jump, this);

  groundWidth = 125;
  blocks = this.physics.add.group();
  spikes = this.physics.add.group();
  ground = this.physics.add.group();
  background = this.add.group();
  for (let i = 0; i < 10; i++) {
    let tile = this.add.tileSprite(i * 125, 720, 148, 125, 'ground');
    ground.add(tile);
    tile.body.allowGravity = false;
    tile.body.immovable = true;
    tile.body.setSize(200, 125);
  }
  bgWidth = 1212;
  for (let i = 0; i < 3; i++) {
    let bgTile = this.add.tileSprite(i * 1212, 0, 1212, 720, 'background');
    bgTile.setDisplaySize(bgTile.width, 1400);
    background.add(bgTile);
    bgTile.setDepth(-1);
  }

  this.physics.add.collider(
    player,
    ground,
    handlePlayerGroundCollision,
    null,
    this
  );

  this.physics.add.collider(
    player,
    blocks,
    handlePlayerBlockCollision,
    null,
    this
  );

  this.physics.add.collider(
    player,
    spikes,
    handlePlayerSpikeCollision,
    null,
    this
  );
  this.makeBlock(0, 0);
}

function handlePlayerGroundCollision(player, tile) {
  player.y = 625;
}
function handlePlayerSpikeCollision(player, spike) {
  lose();
}
function handlePlayerBlockCollision(player, block) {
  if (player.getBounds().bottom >= block.getBounds().top) {
    // Player hits the bottom (game over)
    lose();
  } else if (
    player.getBounds().left <= block.getBounds().right ||
    player.getBounds().right >= block.getBounds().left
  ) {
    // Player hits the left or right side of the block (game over)
    lose();
  }
  // Check if the player hits the top of the block
  if (player.getBounds().top <= block.getBounds().bottom) {
    // Player hits the top, keep player's y position on top
    player.y = block.y - player.height / 2; // Adjust this depending on your setup
  }
}

function jump() {
  if (isJumping) return;
  // Prevent starting multiple jumps at once

  isJumping = true; // Set flag to prevent multiple clicks

  player.body.velocity.y = -1280;
  // Create jump and spin animations using tweens

  this.tweens.add({
    targets: player,
    rotation: '+=' + Phaser.Math.DegToRad(90), // Rotate 720 degrees (2 full spins)
    ease: 'Quad.easeOut',
    duration: 200, // Duration of the jump (upwards motion)
    onComplete: () => {
      // Now apply the gravity fall after the upward jump
      this.tweens.add({
        targets: player,
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
  blocks.getChildren().forEach((block) => {
    block.x -= speed;
  });
  spikes.getChildren().forEach((spike) => {
    spike.x -= speed;
  });
  ground.getChildren().forEach((tile) => {
    tile.x -= speed;

    // If a tile moves off-screen to the left, reset its position to the right
    if (tile.x + groundWidth < 0) {
      tile.x = ground.getChildren().length * groundWidth - groundWidth - 2;
    }
  });
  background.getChildren().forEach((bgTile) => {
    bgTile.x -= speed / 10;

    // If a tile moves off-screen to the left, reset its position to the right
    if (bgTile.x + bgWidth < 0) {
      bgTile.x = background.getChildren().length * bgWidth - bgWidth;
    }
  });
}
function lose() {
  this.tweens.add({
    targets: background.getChildren(), // All images in the group
    tint: [0xff0000, 0xffffff], // Pulse from red (0xff0000) to normal (0xffffff)
    duration: 200, // Duration for one pulse cycle
    yoyo: true, // Yoyo effect to go back and forth
    repeat: 0, // Repeat indefinitely
    ease: 'Sine.easeInOut', // Smooth easing function
  });
}
function makeBlock(xInt, yInt) {
  let block = this.physics.add.image(
    1000 + xInt * 64,
    400 + yInt * 64,
    'block'
  );
  block.setOrigin(0, 1);
  block.body.allowGravity = false;
  block.body.immovable = true;
  block.setDisplaySize(64, 64);
  blocks.add(block);
}
function makeSpike(xInt, yInt) {
  let spike = this.physics.add.image(
    1000 + xInt * 64,
    400 + yInt * 64,
    'spike'
  );
  spike.setOrigin(0, 1);
  spike.body.allowGravity = false;
  spike.body.immovable = true;
  spike.setDisplaySize(64, 64);
  spike.body.setSize(spike.width * 0.2, spike.height * 0.2);
  spikes.add(spike);
}
