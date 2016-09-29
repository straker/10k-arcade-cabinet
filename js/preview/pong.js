// --------------------------------------------------
// PONG
// --------------------------------------------------
games.push( (function() {
  var PADDLE_WIDTH = 5;
  var PADDLE_HEIGHT = 25;
  var BALL_SIZE = 2.5;
  var START_POSITION_Y = (GAME_HEIGHT / 2) - (PADDLE_HEIGHT / 2);
  var COLOR = '#fff';

  var paddle1, paddle2, ball;

  function reset() {
    paddle1 = sprite({
      x: PADDLE_WIDTH,
      y: START_POSITION_Y,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: COLOR,
      context: kontra.context,
      score: 0,
      dy: 2,
      update: function() {
        if (ball.x < GAME_WIDTH) {
          if (ball.y >= this.y + this.height / 2) {
            this.y += this.dy;
          }
          else {
            this.y -= this.dy;
          }
        }
      }
    });
    paddle1.position.clamp(0, START_POSITION_Y, GAME_WIDTH, GAME_HEIGHT - PADDLE_HEIGHT);

    paddle2 = sprite({
      x: GAME_WIDTH - PADDLE_WIDTH * 2,
      y: 0,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: COLOR,
      score: 0,
      dy: 2,
      update: function() {
        if (ball.x < GAME_WIDTH && (ball.x > GAME_WIDTH / 2 || ball.dx < 0) ) {
          if (ball.y >= this.y + this.height / 2 && !this.miss ||
             (this.miss && ball.y > this.y + this.height + 2)) {
            this.y += this.dy;
          }
          else {
            this.y -= this.dy;
          }
        }
        else if (ball.x > GAME_WIDTH) {
          this.y -= this.dy;
        }
      }
    });
    paddle2.position.clamp(0, 0, GAME_WIDTH, GAME_HEIGHT - PADDLE_HEIGHT);

    ball = sprite({
      x: GAME_WIDTH / 2 - BALL_SIZE,
      y: GAME_HEIGHT / 2 - BALL_SIZE,
      width: BALL_SIZE,
      height: BALL_SIZE,
      color: COLOR,
      context: kontra.context,
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

        if (this.x >= GAME_WIDTH - PADDLE_WIDTH * 2.5 && !paddle2.miss) {
          this.dx = -this.dx;
        }

        if (this.y <= 0 || this.y >= GAME_HEIGHT - this.height) {
          this.dy = -this.dy;
        }

        if (this.x > GAME_WIDTH) {
          paddle1.score  = 1;
        }

        // pong controls when the reset of the games reset
        if (this.x > GAME_WIDTH + 20) {
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
      kontra.context.fillStyle = COLOR;
      kontra.context.strokeStyle = COLOR;
      kontra.context.font = '15px monospace';

      kontra.context.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // middle divider
      for(var i = 1; i < GAME_HEIGHT; i += 5) {
        kontra.context.fillRect(GAME_WIDTH / 2 - 2, i, 1, 2.5);
      }

      // score
      kontra.context.fillText(paddle1.score + ' ' + paddle2.score, GAME_WIDTH / 2 - 15, 15);

      paddle1.render();
      paddle2.render();

      if (ball.x < GAME_WIDTH) {
        ball.render();
      }
    },
    reset: reset
  };
})() );