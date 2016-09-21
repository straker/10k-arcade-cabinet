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