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
let play = true;

const game = new Phaser.Game(config);
function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('ground', 'assets/ground.png');
  this.load.image('block', 'assets/block.webp');
  this.load.image('spike', 'assets/spike.png');
  this.load.image('background', 'assets/background.jpg');
  this.load.spritesheet('explosion', 'assets/explosion.png', {
    frameWidth: 100,
    frameHeight: 95,
  });
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
  //COURSE IS CREATED HERE
  makeBlock.call(this, 3, 3);
  makeBlock.call(this, 4, 2);
  makeBlock.call(this, 5, 2);
  makeBlock.call(this, 6, 2);
  makeBlock.call(this, 7, 3);
  makeSpike.call(this, 4, 5);
  makeSpike.call(this, 6, 5);
  makeSpike.call(this, 9, 0);
  makeSpike.call(this, 10, 0);

  for (let i = 0; i < 99; i++) {
    makeSpike.call(this, 10 + 5 * i, 0);
    makeSpike.call(this, 16.8 + 5 * i, 0);
  }

  for (let i = 0; i < 99; i++) {
    makeBlock.call(this, 20 + i, 5);
  }

  // ^^^^

  this.anims.create({
    key: 'explode',
    frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 25 }), // Adjust frame numbers
    frameRate: 60,
    hideOnComplete: true, // Automatically hide when done
  });
}

function handlePlayerGroundCollision(player, tile) {
  player.y = 625;
}
function handlePlayerSpikeCollision(player, spike) {
  lose(player);
  const explosion = this.physics.add
    .sprite(player.x, player.y, 'explosion')
    .play('explode');
  explosion.body.allowGravity = false;
  explosion.on('animationcomplete', () => {
    explosion.destroy();
  });
}
function handlePlayerBlockCollision(player, block) {
  const playerBounds = player.getBounds();
  const blockBounds = block.getBounds();

  // Check for bottom collision - if player hits the bottom of the block, they lose
  if (
    playerBounds.bottom <= blockBounds.top &&
    playerBounds.top < blockBounds.top
  ) {
    // Reposition the player on top of the block
    player.y = block.y - player.height / 2;
  }
  if (
    playerBounds.bottom >= blockBounds.top &&
    playerBounds.top < blockBounds.top
  ) {
    lose();
    return;
  }

  // Check for side collisions (left or right) - if player hits side, they lose
  if (
    playerBounds.left < blockBounds.right &&
    playerBounds.right > blockBounds.left &&
    playerBounds.bottom > blockBounds.top // This ensures that player is not landing from above
  ) {
    lose();
    return;
  }

  // Check if the player hits the top of the block (and they are falling down)
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
  if (play === true) {
    blocks.getChildren().forEach((block) => {
      block.x -= speed;
      if (block.x + block.width < 0) {
        block.destroy(); // Remove block once it goes off-screen
      }
    });

    spikes.getChildren().forEach((spike) => {
      spike.x -= speed;
      if (spike.x + spike.width < -500) {
        spike.destroy(); // Remove spike once it goes off-screen
      }
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
}
function lose() {
  play = false;

  player.destroy(); // Remove the rock
}
function makeBlock(xInt, yInt) {
  let block = this.physics.add.image(750 + xInt * 64, 657 - yInt * 64, 'block');
  blocks.add(block);
  block.setOrigin(0, 1);
  block.body.allowGravity = false;
  block.body.immovable = true;
  block.setDisplaySize(64, 64);
}
function makeSpike(xInt, yInt) {
  let spike = this.physics.add.image(750 + xInt * 64, 657 - yInt * 64, 'spike');
  spikes.add(spike);
  spike.setOrigin(0, 1);
  spike.body.allowGravity = false;
  spike.body.immovable = true;
  spike.setDisplaySize(64, 64);
  spike.body.setSize(spike.width * 0.2, spike.height * 0.2);
}
