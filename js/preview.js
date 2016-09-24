(function(window, document, kontra) {
kontra.init('p');

// constants
var CANVAS_WIDTH = kontra.canvas.width;
var CANVAS_HEIGHT = kontra.canvas.height;

// references
var querySelector = document.querySelector.bind(document);
var sprite = kontra.sprite;

/**
 * Convert degrees to radians.
 * @param {number} deg - Degrees.
 */
function degToRad(deg) {
  return deg * Math.PI / 180;
}

// reset all games
function triggerReset() {
  pong.reset();
  snake.reset();
  helicopter.reset();
  missleCommand.reset();
  breakout.reset();
  tetris.reset();
}

// --------------------------------------------------
// GAME_LOOP
// --------------------------------------------------
window.loop = kontra.gameLoop({
  update: function(dt) {
    pong.update(dt);
    snake.update(dt);
    helicopter.update(dt);
    missleCommand.update(dt);
    breakout.update(dt);
    tetris.update(dt);
  },
  render: function() {
    pong.render();
    snake.render();
    helicopter.render();
    missleCommand.render();
    breakout.render();
    tetris.render();
  },
  fps: 30
});

loop.start();

// --------------------------------------------------
// BREAKOUT
// --------------------------------------------------
var breakout = (function() {
  var breakoutCanvas = querySelector('#b');
  var breakoutContext = breakoutCanvas.getContext('2d');

  var COLORS = ['#f00', '#ffa500', '#19823a', '#ff0'];
  var GAME_X = 29;  // game is taller than it is wide
  var GAME_WIDTH = CANVAS_WIDTH - 29 * 2 - 1;
  var GAME_X_RIGHT = CANVAS_WIDTH - GAME_X - 3;
  var BRICK_START_Y = 30;
  var NUM_BRICKS = 112;
  var BRICKS_PER_ROW = 14;
  var BRICK_WIDTH = 6;
  var BRICK_HEIGHT = 2;

  breakoutContext.font = '10px monospace';

  var highScore = '000';
  var angles = [325, 35];
  var pos = [120, 98, 50, 74, GAME_X + 7, GAME_X + 4, GAME_X_RIGHT - BRICK_WIDTH];
  var brickRemove = [102, 105];
  var score, bricks, paddle, ball, counter, posIndex;

  function reset() {
    bricks = [];
    counter = 0;
    posIndex = 0;
    score = 0;

    for (var i = 0; i < NUM_BRICKS; i++) {
      bricks.push({
        x: (GAME_X + 2) + (i % BRICKS_PER_ROW) * 7,
        y: BRICK_START_Y + 3 * (i / BRICKS_PER_ROW | 0),
        color: COLORS[i / (BRICKS_PER_ROW * 2) | 0]
      });
    }

    paddle = kontra.sprite({
      x: 80 - BRICK_WIDTH / 2,
      y: 110,
      width: BRICK_WIDTH,
      height: BRICK_HEIGHT,
      context: breakoutContext,
      color: '#096ea0',
      speed: 1.1,
      update: function() {
        this.advance();

        if (this.dx > 0 && this.x > pos[posIndex] ||
            this.dx < 0 && this.x < pos[posIndex]) {
          this.x = pos[posIndex];
          this.dx = 0;
          posIndex++;
        }
        else if (pos[posIndex] - this.x > 0) {
          this.dx = this.speed;
        }
        else if (pos[posIndex] - this.x < 0) {
          this.dx = -this.speed;
        }
      }
    });

    ball = kontra.sprite({
      x: 100,
      y: 70,
      width: 2,
      height: 2,
      context: breakoutContext,
      color: '#fff',
      angle: 125,
      magnitude: 1,
      update: function() {
        this.dx = this.dx ||  Math.sin( degToRad(this.angle) ) * this.magnitude;
        this.dy = this.dy || -Math.cos( degToRad(this.angle) ) * this.magnitude;

        if (this.x < GAME_X + 2) {
          this.x = GAME_X + 2;
          this.dx = -this.dx;
        }
        else if (this.x > GAME_X_RIGHT - this.width) {
          this.x = GAME_X_RIGHT - this.width;
          this.dx = -this.dx;
        }

        if (this.y < 53) {
          this.y = 53;
          this.dy = -this.dy;

          bricks[ brickRemove[counter-1] ].dead = true;
          score++;
        }

        if (this.y > paddle.y - this.height && !this.dead) {
          this.y = paddle.y - this.height;
          this.angle = angles[counter];
          this.dx = null;
          this.dy = null;
          this.magnitude += 0.4;

          if (++counter == 2) {
            this.dead = true;
          }
        }

        this.advance();
      }
    });
  }

  reset();

  return {
    update: function(dt) {
      paddle.update();
      ball.update();
    },
    render: function() {
      breakoutContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // walls
      breakoutContext.fillStyle = '#fff';
      breakoutContext.fillRect(GAME_X, 0, 2, CANVAS_HEIGHT);
      breakoutContext.fillRect(GAME_X_RIGHT, 0, 2, CANVAS_HEIGHT);
      breakoutContext.fillRect(GAME_X, 10, GAME_WIDTH, 5);
      breakoutContext.fillRect(GAME_X + 7, 15, 2, 7);
      breakoutContext.fillRect(GAME_X + 60, 15, 2, 7);

      breakoutContext.fillText('00' + score + '      ' + highScore, GAME_X + 10, 28);

      // bricks
      for (var i = 0, brick; (brick = bricks[i]); i++) {
        breakoutContext.fillStyle = brick.color;

        // color walls same color as the brick
        if (i % BRICKS_PER_ROW === 0) {
          breakoutContext.fillRect(GAME_X, brick.y, 2, BRICK_HEIGHT + 1);
        }
        else if (i % BRICKS_PER_ROW === BRICKS_PER_ROW - 1) {
          breakoutContext.fillRect(GAME_X_RIGHT, brick.y, 2, BRICK_HEIGHT + 1);
        }

        if (!brick.dead) {
          breakoutContext.fillRect(brick.x, brick.y, 6, BRICK_HEIGHT);
        }
      }

      // paddle
      paddle.render();
      breakoutContext.fillRect(GAME_X, paddle.y, 2, BRICK_HEIGHT + 1);
      breakoutContext.fillRect(GAME_X_RIGHT, paddle.y, 2, BRICK_HEIGHT + 1);

      ball.render();
    },
    reset: reset
  };
})();

// --------------------------------------------------
// HELICOPTER
// --------------------------------------------------
var helicopter = (function() {
  var helicopterCanvas = querySelector('#h');
  var helicopterContext = helicopterCanvas.getContext('2d');

  var COLOR = '#fff';
  var HELICOPTER_SIZE = 5;

  helicopterContext.fillStyle = COLOR;
  helicopterContext.strokeStyle = COLOR;
  helicopterContext.lineWidth = 3;

  var gaps = [
    {x: 33, length: 73},
    {x: 36, length: 72},
    {x: 33, length: 71},
    {x: 30, length: 70},
    {x: 28, length: 69},
    {x: 26, length: 68},
    {x: 26, length: 67},
    {x: 27, length: 66},
    {x: 29, length: 65},
    {x: 30, length: 64},
    {x: 32, length: 63},
    {x: 35, length: 62},
    {x: 37, length: 61},
    {x: 40, length: 60},
    {x: 40, length: 59},
    {x: 39, length: 58},
    {x: 36, length: 57},
    {x: 37, length: 56},
    {x: 39, length: 55},
    {x: 42, length: 54},
    {x: 42, length: 53},
    {x: 45, length: 52},
    {x: 44, length: 51},
    {x: 43, length: 50},
    {x: 45, length: 49},
    {x: 47, length: 48},
    {x: 50, length: 47},
    {x: 53, length: 46},
    {x: 54, length: 45},
    {x: 56, length: 44},
    {x: 59, length: 43},

    {x: 60, length: 43},
    {x: 62, length: 44},
    {x: 64, length: 45},
    {x: 65, length: 46},
    {x: 66, length: 47},
    {x: 68, length: 48},
    {x: 70, length: 49},
    {x: 65, length: 50},
    {x: 62, length: 51},
    {x: 60, length: 52},
    {x: 58, length: 53},
    {x: 57, length: 54},
    {x: 53, length: 55},
    {x: 50, length: 56},
    {x: 51, length: 57},
    {x: 48, length: 58},
    {x: 45, length: 59},
    {x: 40, length: 60},
    {x: 37, length: 61},
    {x: 35, length: 62},
    {x: 32, length: 63},
    {x: 30, length: 64},
    {x: 27, length: 65},
    {x: 26, length: 66},
    {x: 23, length: 67},
    {x: 20, length: 68},
    {x: 21, length: 69},
    {x: 23, length: 70},
    {x: 26, length: 71},
    {x: 29, length: 72},
    {x: 32, length: 73},
  ];
  var counter = 0;
  var gapIndex, helicopter;

  function reset() {
    gapIndex = 0;

    helicopter = sprite({
      x: 60,
      y: 105,
      dx: 2,
      ddx: 0.7,
      update: function() {
        var i = gapIndex - 22;
        var index = (i >= 0 ? i : i + gaps.length);
        var gap = gaps[index];

        var moveTo = gap.x + 20;

        if (this.x <= moveTo) {
          this.ddx = Math.abs(this.ddx);
        }
        else {
          this.ddx = -Math.abs(this.ddx);
        }

        this.dx += this.ddx;
        this.x += this.dx;
      },
      render: function() {
        helicopterContext.beginPath();
        helicopterContext.moveTo(this.x, this.y);
        helicopterContext.lineTo(this.x + HELICOPTER_SIZE, this.y - HELICOPTER_SIZE);
        helicopterContext.lineTo(this.x + HELICOPTER_SIZE * 2, this.y);
        helicopterContext.stroke();
      }
    });
    helicopter.velocity.clamp(-2, 0, 2, 0);
  }

  reset();

  // loop
  return {
    update: function(dt) {
      counter += dt;

      // slow down the snake fps
      if (counter > 1 / 30) {
        gapIndex = (gapIndex + 1) % (gaps.length - 1);
        helicopter.update();
        counter -= 1 / 30;
      }
    },
    render: function() {
      helicopterContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // gaps
      helicopterContext.beginPath();
      helicopterContext.moveTo(0, 0);

      for (var i = gapIndex, x = 0, gap; x < 30; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        helicopterContext.lineTo(gap.x, y);

        if (i <= 0) {
          i = gaps.length;
        }
      }

      helicopterContext.lineTo(0, CANVAS_HEIGHT);
      helicopterContext.fill();

      helicopterContext.beginPath();
      helicopterContext.moveTo(CANVAS_WIDTH, 0);

      for (var i = gapIndex, x = 0, gap; x < 30; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        helicopterContext.lineTo(gap.x + gap.length, y);

        if (i <= 0) {
          i = gaps.length;
        }
      }

      helicopterContext.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      helicopterContext.fill();

      helicopter.render();
    },
    reset: reset
  };
})();

// --------------------------------------------------
// MISSILE COMMAND
// --------------------------------------------------
var missleCommand = (function() {
  var missileCommandCanvas = querySelector('#m');
  var missileCommandContext = missileCommandCanvas.getContext('2d');

  var MISSILE_START_Y = 8;

  missileCommandContext.font = '8px monospace';

  var ground = [
    // left missile base
    {x: 0, y: 110},
    {x: 8, y: 103},
    {x: 10, y: 105},
    {x: 16, y: 105},
    {x: 18, y: 103},
    {x: 26, y: 110},

    // left bump
    {x: 35, y: 110},
    {x: 36, y: 108},
    {x: 38, y: 108},
    {x: 39, y: 110},

    // center missile base
    {x: 70, y: 110},
    {x: 75, y: 103},
    {x: 77, y: 105},
    {x: 83, y: 105},
    {x: 85, y: 103},
    {x: 90, y: 110},

    // right bump
    {x: 106, y: 110},
    {x: 107, y: 108},
    {x: 117, y: 108},
    {x: 118, y: 110},

    // right missile base
    {x: 134, y: 110},
    {x: 142, y: 103},
    {x: 144, y: 105},
    {x: 150, y: 105},
    {x: 152, y: 103},
    {x: 160, y: 110}
  ];

  var cities = [
    {x: 26, y: 106},
    {x: 42, y: 107},
    {x: 55, y: 108},
    {x: 92, y: 107},
    {x: 108, y: 104},
    {x: 123, y: 106}
  ];

  var missileColor = '#f00';
  var counterMissileColor = '#00f';

  // missiles
  // 0 is up, 90 is right
  var missiles = [];
  var firstWave = [
    {startX: 0, x: 0, y: MISSILE_START_Y, angle: 130, color: missileColor},
    {startX: 10, x: 10, y: MISSILE_START_Y, angle: 162, color: missileColor},
    {startX: 115, x: 115, y: MISSILE_START_Y, angle: 195, color: missileColor},
    {startX: 150, x: 150, y: MISSILE_START_Y, angle: 195, color: missileColor}
  ];
  var secondWave = [
    {startX: 70, x: 70, y: MISSILE_START_Y, angle: 210, color: missileColor},
    {startX: 80, x: 80, y: MISSILE_START_Y, angle: 155, color: missileColor},
    {startX: 106, x: 106, y: MISSILE_START_Y, angle: 180, color: missileColor},
    {startX: 118, x: 118, y: MISSILE_START_Y, angle: 180, color: missileColor}
  ];

  var highScore = '7500';
  var counter, added, counterMissiles, leftCounterMissles, centerCounterMissles, rightCounterMissles, explotions, score;

  function reset() {
    counter = 0;
    timer = 0;
    added = false;
    explotions = [];
    score = ' 0';

    // counter missiles
    counterMissiles = [
      {pos: 'left', startX: 13, x: 13, startY: 105, y: 105, angle: 16, color: counterMissileColor, t: 3, e: 5.4},
      {pos: 'left', startX: 13, x: 13, startY: 105, y: 105, angle: 12, color: counterMissileColor, t: 4, e: 5.8}
    ];

    // missiles
    missiles.length = 0;
    for (var i = 0; i < firstWave.length; i++) {
      missiles.push(JSON.parse(JSON.stringify(firstWave[i])));
    }

    leftCounterMissles = centerCounterMissles = rightCounterMissles = 10;
  }

  reset();

  // loop
  return {
    update: function(dt) {
      counter += dt;

      // slow down the game fps
      if (counter > 1 / 25) {
        timer += dt;

        if (!added && timer >= 2) {
          added = true;

          for (var i = 0; i < secondWave.length; i++) {
            missiles.push(JSON.parse(JSON.stringify(secondWave[i])));
          }
        }

        // counter missiles
        for (var i = 0, counterMissile; (counterMissile = counterMissiles[i]); ) {
          if (timer >= counterMissile.t) {
            missiles.push(counterMissile);
            counterMissiles.splice(i, 1);

            if (counterMissile.pos == 'left') {
              leftCounterMissles--;
            }
            else if (counterMissile.pos == 'right') {
              rightCounterMissles--;
            }
          }
          else {
            i++;
          }
        }

        // missiles
        for (var i = 0, missile; (missile = missiles[i]); i++) {
          var dx =  Math.sin( degToRad(missile.angle) );
          var dy = -Math.cos( degToRad(missile.angle) );

          // missiles move slower
          if (missile.color === missileColor) {
            dx *= 1/4;
            dy *= 1/4;
          }

          missile.x += dx;
          missile.y += dy;

          if (missile.e && timer >= missile.e) {
            missile.explode = true;
            score = parseInt(score) + 25;
          }
        }

        // explotions
        for (var i = 0, explotion; (explotion = explotions[i]); i++) {
          explotion.r += 0.2;
        }

        counter -= 1 / 25;
      }
    },
    render: function() {
      missileCommandContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // ground
      missileCommandContext.fillStyle = '#ff0';
      missileCommandContext.beginPath();
      missileCommandContext.moveTo(0, CANVAS_HEIGHT);

      for (var i = 0; i < ground.length; i++) {
        missileCommandContext.lineTo(ground[i].x, ground[i].y);
      }

      missileCommandContext.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      missileCommandContext.fill();

      // counter missile bays
      missileCommandContext.fillStyle = '#000';
      for (var i = 0, x = 0, y = 0; i < 10; i++) {

        if (i == 1 || i == 3 || i == 6) {
          x = -1 * (i == 3 ? 2 : i == 6 ? 3 : 1);
          y += 1;
        }

        if (i < leftCounterMissles) {
          missileCommandContext.fillRect(13 + x, 107 + y, 1, 1);
        }

        if (i < centerCounterMissles) {
          missileCommandContext.fillRect(80 + x, 107 + y, 1, 1);
        }

        if (i < rightCounterMissles) {
          missileCommandContext.fillRect(147 + x, 107 + y, 1, 1);
        }

        x += 2;
      }

      // cities
      for (var i = 0, city; (city = cities[i]); i++) {
        missileCommandContext.fillStyle = '#00f';
        missileCommandContext.fillRect(city.x, city.y, 3, 4);
        missileCommandContext.fillRect(city.x + 5, city.y, 3, 4);

        missileCommandContext.fillStyle = '#0ff';
        missileCommandContext.fillRect(city.x + 1, city.y + 2, 6, 2);
      }

      // missiles
      for (var i = 0, missile; (missile = missiles[i]); ) {
        // tail
        missileCommandContext.strokeStyle = missile.color;
        missileCommandContext.beginPath();
        missileCommandContext.moveTo(missile.x, missile.y);
        missileCommandContext.lineTo(missile.startX, missile.startY || MISSILE_START_Y);
        missileCommandContext.stroke();

        // head
        missileCommandContext.fillStyle = '#fff';
        missileCommandContext.fillRect(missile.x - 0.5, missile.y, 1, 1);

        if (missile.explode) {
          missiles.splice(i, 1);
          missiles.splice(0, 1);

          missile.r = 1;
          explotions.push(missile);

          i--;
        }
        else {
          i++;
        }
      }

      // explotions
      for (var i = 0, explotion; (explotion = explotions[i]); i++) {
        missileCommandContext.fillStyle = '#00f';
        missileCommandContext.beginPath();
        missileCommandContext.arc(explotion.x, explotion.y, explotion.r, 0, 2 * Math.PI);
        missileCommandContext.fill();
      }

      missileCommandContext.fillStyle = '#f00';
      missileCommandContext.fillText(score + '      ' + highScore, 30, 7);
    },
    reset: reset
  };
})();

// --------------------------------------------------
// PONG
// --------------------------------------------------
var pong = (function() {
  var pongCanvas = querySelector('#p');
  var pongContext = pongCanvas.getContext('2d');

  var PADDLE_WIDTH = 5;
  var PADDLE_HEIGHT = 25;
  var BALL_SIZE = 2.5;
  var START_POSITION_Y = (CANVAS_HEIGHT / 2) - (PADDLE_HEIGHT / 2);
  var COLOR = '#fff';

  pongContext.fillStyle = COLOR;
  pongContext.font = '15px monospace';

  var paddle1, paddle2, ball;

  function reset() {
    paddle1 = sprite({
      x: PADDLE_WIDTH,
      y: START_POSITION_Y,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: COLOR,
      context: pongContext,
      score: 0,
      dy: 2,
      update: function() {
        if (ball.x < CANVAS_WIDTH) {
          if (ball.y >= this.y + this.height / 2) {
            this.y += this.dy;
          }
          else {
            this.y -= this.dy;
          }
        }
      }
    });
    paddle1.position.clamp(0, START_POSITION_Y, CANVAS_WIDTH, CANVAS_HEIGHT - PADDLE_HEIGHT);

    paddle2 = sprite({
      x: CANVAS_WIDTH - PADDLE_WIDTH * 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT * 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: COLOR,
      context: pongContext,
      score: 0,
      dy: 2,
      update: function() {
        if (ball.x > CANVAS_WIDTH / 2) {
          if (ball.y >= this.y + this.height / 2 && !this.miss ||
             (this.miss && ball.y > this.y + this.height + 2)) {
            this.y += this.dy;
          }
          else {
            this.y -= this.dy;
          }
        }
      }
    });
    paddle2.position.clamp(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - PADDLE_HEIGHT);

    ball = sprite({
      x: CANVAS_WIDTH / 2 - BALL_SIZE,
      y: CANVAS_HEIGHT / 2 - BALL_SIZE,
      width: BALL_SIZE,
      height: BALL_SIZE,
      color: COLOR,
      context: pongContext,
      dx: -2,
      dy: 2,
      counter: 0,
      update: function() {
        this.advance();

        if (this.x <= PADDLE_WIDTH * 2) {
          this.dx = -this.dx;

          if (++this.counter === 2) {
            paddle2.miss = true;
          }
        }

        if (this.x >= CANVAS_WIDTH - PADDLE_WIDTH * 2.5 && !paddle2.miss) {
          this.dx = -this.dx;
        }

        if (this.y <= 0 || this.y >= CANVAS_HEIGHT - this.height) {
          this.dy = -this.dy;
        }

        if (this.x > CANVAS_WIDTH) {
          paddle1.score  = 1;
        }

        // pong controls when the reset of the games reset
        if (this.x > CANVAS_WIDTH + 20) {
          triggerReset();
        }
      }
    });
  }

  reset();

  // loop
  return {
    update: function() {
      paddle1.update();
      paddle2.update();
      ball.update();
    },
    render: function() {
      // middle divider
      for(var i = 1; i < CANVAS_HEIGHT; i += 5) {
        pongContext.fillRect(CANVAS_WIDTH / 2 - 2, i, 1, 2.5);
      }

      // score
      pongContext.fillText(paddle1.score + ' ' + paddle2.score, 65, 15);

      paddle1.render();
      paddle2.render();
      ball.render();
    },
    reset: reset
  };
})();

// --------------------------------------------------
// SNAKE
// --------------------------------------------------
var snake = (function() {
  var snakeCanvas = querySelector('#s');
  var snakeContext = snakeCanvas.getContext('2d');

  var SNAKE_SIZE = 5;
  var START_LENGTH = 4;
  var START_X = 100;
  var START_Y = 20;
  var COLOR = '#fff';

  snakeContext.fillStyle = COLOR;

  var snake, pellet;
  var counter = 0;
  var pelletPos = [
    {x: 40, y: 50},
    {x: 100, y: 100},
    {x: 20, y: 20},
    {x: 30, y: 75},
    {x: 90, y: 5},
    {x: 70, y: 5},
    {x: 70, y: 25},
    {x: 100, y: 25}
  ];

  function reset() {
    pelletIndex = 1;

    snake = sprite({
      x: START_X,
      y: 20,
      width: SNAKE_SIZE * START_LENGTH,
      height: SNAKE_SIZE,
      color: COLOR,
      context: snakeContext,
      length: START_LENGTH,
      body: [],
      dead: false,
      update: function() {
        if (!this.dead) {
          if (pellet.x < this.x) {
            this.x -= SNAKE_SIZE;
          }
          else if (pellet.x > this.x) {
            this.x += SNAKE_SIZE;
          }
          else {
            if (pellet.y < this.y) {
              this.y -= SNAKE_SIZE;
            }
            else if (pellet.y > this.y) {
              this.y += SNAKE_SIZE;
            }
          }

          // snake eat a pellet
          if (this.x === pellet.x && this.y == pellet.y) {
            pellet.x = pelletPos[pelletIndex].x;
            pellet.y = pelletPos[pelletIndex].y;

            pelletIndex++;

            this.length += 2;
          }

          // snake ran into itself
          for (var i = 0, pos; (pos = snake.body[i]); i++) {
            if (snake.x === pos.x && snake.y === pos.y) {
              this.dead = true;
              return;
            }
          }

          // update snake body positions
          this.body.unshift({x: this.x, y: this.y});

          if (this.body.length > this.length) {
            this.body.pop();
          }
        }
      },
      render: function() {
        for (var i = 0, pos; (pos = this.body[i]); i++) {
          snakeContext.fillRect(pos.x, pos.y, SNAKE_SIZE, SNAKE_SIZE);
        }
      }
    });

    // initialize snake body
    for (var i = 0; i < START_LENGTH; i++) {
      snake.body[i] = {x: START_X + (i * SNAKE_SIZE), y: START_Y};
    }

    pellet = sprite({
      x: pelletPos[0].x,
      y: pelletPos[0].y,
      render: function() {
        snakeContext.beginPath();
        snakeContext.arc(this.x + 2.5, this.y + 2.5, 2.5, 0, 2 * Math.PI);
        snakeContext.fill();
      }
    });
  }

  reset();

  // loop
  return {
    update: function(dt) {
      counter += dt;

      // slow down the snake fps
      if (counter > 1 / 15) {
        snake.update();
        counter -= 1 / 15;
      }
    },
    render: function() {
      snakeContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      snake.render();
      pellet.render();
    },
    reset: reset
  };
})();

// --------------------------------------------------
// TETRIS
// --------------------------------------------------
var tetris = (function() {
  var tetrisCanvas = querySelector('#t');
  var tetrisContext = tetrisCanvas.getContext('2d');

  tetrisContext.strokeStyle = '#000';
  tetrisContext.lineWidth = 0.5;
  tetrisContext.font = '4px monospace';

  var BOARD_WIDTH = 10;
  var BOARD_HEIGHT = 20;
  var TETRIMINO_WIDTH = 5;
  var GAME_X = 53;  // game is taller than it is wide
  var GAME_Y = 10;
  var GAME_WIDTH = TETRIMINO_WIDTH * BOARD_WIDTH;
  var GAME_HEIGHT = TETRIMINO_WIDTH * BOARD_HEIGHT;
  var GAME_X_RIGHT = CANVAS_WIDTH - GAME_X - 1;
  var BOX_WIDTH = 35;
  var BOX_HEIGHT = 10;

  var COLORS = [
    '',
    'cyan',    // 1
    'yellow',  // 2
    'purple',  // 3
    'green',   // 4
    'red',     // 5
    'blue',    // 6
    'orange'   // 7
  ];

  var boardStart = [
    0, 0, 4, 0, 0, 0, 0, 7, 0, 2,
    6, 4, 4, 0, 0, 0, 2, 7, 2, 2,
    6, 6, 4, 6, 1, 1, 2, 7, 6, 0,
    6, 4, 3, 0, 1, 1, 5, 5, 5, 5
  ];
  var board = [];
  var positions = [1, 7, 3];
  var counter = 0;
  var score, highScore, currentTermino, seconds, positionIndex, boardRow, nextTermino;

  function reset() {
    seconds = 11;
    score = 1950;
    highScore = 2500;
    positionIndex = 0;
    board = Array.from(boardStart);
    boardRow = 16;

    currentTermino = sprite({
      x: GAME_X + 2 + TETRIMINO_WIDTH * 4,
      y: GAME_Y + 10,
      color: COLORS[3],
      counter: 0,
      rotateCounter: 0,
      pattern: [
        1, 0, 0,
        1, 1, 1,
        0, 0, 0,
      ],
      rowLength: 3,
      context: tetrisContext,
      // @see http://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
      rotate: function() {
        var newGrid = [];

        for (var i = 0; i < this.pattern.length; i++) {
          // convert to x/y
          var x = i % this.rowLength;
          var y = i / this.rowLength | 0;

          // find new x/y
          var newX = this.rowLength - y - 1;
          var newY = x;

          // convert to index
          var newPosition = newY * this.rowLength + newX;
          newGrid[newPosition] = this.pattern[i];
        }

        this.pattern = newGrid;
      },
      update: function(dt) {
        this.counter += dt;
        this.rotateCounter += dt;

        if (this.rotateCounter > 0.4) {
          if (positionIndex < positions.length) {
            this.rotate();
          }

          if (this.x > GAME_X + 2 + positions[positionIndex] * TETRIMINO_WIDTH) {
            this.x -= TETRIMINO_WIDTH;
          }
          else if (this.x < GAME_X + 2 + positions[positionIndex] * TETRIMINO_WIDTH) {
            this.x += TETRIMINO_WIDTH;
          }
          else if (positionIndex < positions.length) {
            positionIndex++;
          }

          this.rotateCounter -= 0.4;
        }

        // slow down the snake fps
        if (this.counter > 0.5) {

          if (this.y < GAME_Y + boardRow * TETRIMINO_WIDTH) {
            this.y += TETRIMINO_WIDTH;
          }
          // clear row
          else if (board.length > 30) {
            board[3] = 3;
            board.splice(10, 10);
            boardRow++;
            currentTermino = Object.assign({}, nextTermino);
            currentTermino.x = GAME_X + 2 + TETRIMINO_WIDTH * 4;
            currentTermino.y = GAME_Y + TETRIMINO_WIDTH;
            score += 100;

            nextTermino.color = COLORS[1];
            nextTermino.pattern = [
              1, 1, 0,
              1, 1, 0
            ];
          }

          this.counter -= 0.5;
        }
      },
      render: function() {
        this.context.fillStyle = this.color;

        for (var i = 0, r = 0; i < this.pattern.length; i++) {
          if (this.pattern[i]) {
            var x = this.x + (i % this.rowLength) * TETRIMINO_WIDTH;
            var y = this.y + r * TETRIMINO_WIDTH;

            tetrisContext.fillRect(x, y, TETRIMINO_WIDTH, TETRIMINO_WIDTH);
            tetrisContext.strokeRect(x + 0.5, y + 0.5, TETRIMINO_WIDTH + 1, TETRIMINO_WIDTH + 1);
          }

          if (i % this.rowLength == this.rowLength - 1) {
            r++;
          }
        }
      }
    });

    nextTermino = Object.assign({}, currentTermino, {
      color: COLORS[5],
      pattern: [
        1, 1, 0,
        0, 1, 1
      ],
      x: 119,
      y: 15
    });
  }

  reset();

  // loop
  return {
    update: function(dt) {
      counter += dt;

      if (counter > 1) {
        seconds++;
        counter -= 1;
      }

      currentTermino.update(dt);
    },
    render: function() {
      tetrisContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      currentTermino.render();
      nextTermino.render();

      for (var i = 0, r = boardRow; i < board.length; i++) {
        if (board[i]) {
          tetrisContext.fillStyle = COLORS[ board[i] ];

          var x = GAME_X + 2 + (i % 10) * TETRIMINO_WIDTH;
          var y = GAME_Y + r * TETRIMINO_WIDTH;

          tetrisContext.fillRect(x, y, TETRIMINO_WIDTH, TETRIMINO_WIDTH);
          tetrisContext.strokeRect(x + 0.5, y + 0.5, TETRIMINO_WIDTH + 1, TETRIMINO_WIDTH + 1);
        }

        if (i % 10 == 9) {
          r++;
        }
      }

      // box order: top, right, bottom, left

      // walls
      tetrisContext.fillStyle = '#fff';
      tetrisContext.fillRect(GAME_X, GAME_Y, GAME_WIDTH + 4, 2);
      tetrisContext.fillRect(GAME_X_RIGHT, GAME_Y, 2, GAME_HEIGHT + 2);
      tetrisContext.fillRect(GAME_X, GAME_Y + GAME_HEIGHT, GAME_WIDTH + 4, 2);
      tetrisContext.fillRect(GAME_X, GAME_Y, 2, GAME_HEIGHT);

      // time box
      tetrisContext.fillRect(10, 12, 4, 1);
      tetrisContext.fillRect(26, 12, 20, 1);
      tetrisContext.fillRect(10 + BOX_WIDTH, 12, 1, BOX_HEIGHT + 1);
      tetrisContext.fillRect(10, 12 + BOX_HEIGHT, BOX_WIDTH, 1);
      tetrisContext.fillRect(10, 12, 1, BOX_HEIGHT);
      tetrisContext.fillText('2 : ' + seconds, 15, 19);
      tetrisContext.fillText('Time', 15, 13);

      // next box
      tetrisContext.fillRect(114, 12, 4, 1);
      tetrisContext.fillRect(130, 12, 20, 1);
      tetrisContext.fillRect(114 + BOX_WIDTH, 12, 1, 16 + 1);
      tetrisContext.fillRect(114, 12 + 16, BOX_WIDTH, 1);
      tetrisContext.fillRect(114, 12, 1, 16);
      tetrisContext.fillText('Next', 119, 13);

      // score
      tetrisContext.fillRect(114, 40, 4, 1);
      tetrisContext.fillRect(133, 40, 17, 1);
      tetrisContext.fillRect(114 + BOX_WIDTH, 40, 1, BOX_HEIGHT + 1);
      tetrisContext.fillRect(114, 40 + BOX_HEIGHT, BOX_WIDTH, 1);
      tetrisContext.fillRect(114, 40, 1, BOX_HEIGHT);
      tetrisContext.fillText(score, 119, 48);
      tetrisContext.fillText('Score', 119, 42);

      // high score
      tetrisContext.fillRect(114, 57, 4, 1);
      tetrisContext.fillRect(145, 57, 5, 1);
      tetrisContext.fillRect(114 + BOX_WIDTH, 57, 1, BOX_HEIGHT + 1);
      tetrisContext.fillRect(114, 57 + BOX_HEIGHT, BOX_WIDTH, 1);
      tetrisContext.fillRect(114, 57, 1, BOX_HEIGHT);
      tetrisContext.fillText(highScore, 119, 64);
      tetrisContext.fillText('High Score', 119, 58);
    },
    reset: reset
  };
})();
})(window, document, kontra);