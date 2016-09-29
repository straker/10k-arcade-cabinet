game.pong = (function() {

  // add magnitude to kontra.vector
  Object.defineProperties(kontra.vector.prototype, {
    magnitude: {
      get: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
      }
    }
  });

  // constants
  var GAME_WIDTH = kontra.canvas.width;
  var GAME_HEIGHT = kontra.canvas.height;
  var PADDLE_WIDTH = 5;
  var PADDLE_HEIGHT = 50;
  var START_POSITION_Y = (GAME_HEIGHT / 2) - (PADDLE_HEIGHT / 2);

  // references
  var canvas = kontra.canvas;
  var context = kontra.context;
  var sprite = kontra.sprite;

  // variables
  var player = sprite({
    x: PADDLE_WIDTH,
    y: START_POSITION_Y,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#fff',
    score: 0,
    dy: 4,
    update: function() {
      if (game.upPressed) {
        this.y -= this.dy;
      }
      else if (game.downPressed) {
        this.y += this.dy;
      }
    }
  });

  player.position.clamp(0, 0, GAME_WIDTH, GAME_HEIGHT - PADDLE_HEIGHT);

  var computer = sprite({
    x: GAME_WIDTH - (PADDLE_WIDTH * 2),
    y: START_POSITION_Y,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#fff',
    score: 0,
    dy: 4,
    update: function() {
      var targetBall = (invisibleBall.alive ? invisibleBall : ball);

      if (targetBall.y < this.y + this.height / 2) {
        this.y -= this.dy;
      }
      else if (targetBall.y > this.y + this.height / 2) {
        this.y += this.dy;
      }
    }
  });

  computer.position.clamp(0, 0, GAME_WIDTH, GAME_HEIGHT - PADDLE_HEIGHT);

  var ball = sprite({
    width: 10,
    height: 10,
    color: '#fff',
    x: GAME_WIDTH / 2 - 5,
    y: GAME_HEIGHT / 2 - 5,
    dx: 3,
    dy: Math.random() > 0.5 ? -3 : 3,
    update: function() {
      this.advance();

      if (this.y < 0) {
        this.y = 0;
        this.dy = -this.dy;
      }
      else if (this.y > GAME_HEIGHT - this.height) {
        this.y = GAME_HEIGHT - this.height;
        this.dy = -this.dy;
      }

      var collides = false;

      if (this.x > player.x && this.collidesWith(player)) {
        collides = player;
        this.x = player.x + player.width;
      }
      else if (this.x < computer.x + computer.width && this.collidesWith(computer)) {
        collides = computer;
        this.x = computer.x - this.width;
      }

      if (collides) {
        // make the end of the paddle only 80%
        var height = (player.height / 2);
        var percent = ( (this.y + this.height / 2) - (collides.y + collides.height / 2)) / height;
        percent = Math.max(Math.min(percent, 0.8), -0.8);
        var currMagnitude = this.velocity.magnitude;

        // change the velocity based on the new percent
        this.dx = Math.abs(currMagnitude * Math.sin(90 * (1 - percent) * Math.PI / 180));
        this.dy = currMagnitude * Math.cos((90 - 90 * percent) * Math.PI / 180);

        if (collides === computer) {
          this.dx = -this.dx;
        }
        else {
          // spawn the invisible ball at the players location
          invisibleBall.x = this.x;
          invisibleBall.y = this.y;
          invisibleBall.dy = this.dy * 1.5;
          invisibleBall.dx = this.dx * 1.5;
          invisibleBall.alive = true;
        }
      }
    }
  });

  // use an invisible ball for the computer to chase
  // @see http://gamedev.stackexchange.com/questions/57352/imperfect-pong-ai
  var invisibleBall = sprite({
    width: ball.width,
    height: ball.height,
    color: 'red',
    dx: 4,
    alive: false,
    update: function() {
      this.advance();

      if (this.y < 0 || this.y > GAME_HEIGHT) {
        this.dy = -this.dy;
      }
    }
  });

  context.fillStyle = '#FFF';
  context.font = '60px monospace';

  var loop = kontra.gameLoop({
    update: function() {
      game.updateKeys();

      player.update();
      computer.update();
      ball.update();

      if (invisibleBall.alive) {
        invisibleBall.update();

        if (invisibleBall.x > computer.x) {
          invisibleBall.alive = false;
        }
      }
    },
    render: function() {
      context.fillStyle = '#fff';

      // middle divider
      for(var i = 5; i < GAME_HEIGHT; i += 20) {
        context.fillRect(GAME_WIDTH / 2 - 2, i, 4, 10);
      }

      // score
      context.fillText(player.score + ' ' + computer.score, 156, 60);

      player.render();
      computer.render();
      ball.render();
      invisibleBall.render();
    }
  });

  return loop;
})();