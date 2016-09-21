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