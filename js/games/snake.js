game.snake = (function() {

  // constants
  var GAME_WIDTH = kontra.canvas.width;
  var GAME_HEIGHT = kontra.canvas.height;
  var START_LENGTH = 5;
  var SNAKE_SIZE = 10;
  var HEIGHT = GAME_HEIGHT / SNAKE_SIZE;
  var WIDTH = GAME_WIDTH / SNAKE_SIZE;

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   * @see http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // variables
  var queue = [];
  var openTiles = [];

  for (var i = 0; i < WIDTH * HEIGHT; i++) {
    openTiles.push(i);
  }

  var snake = kontra.sprite({
    color: '#fff',
    body: [],
    length: START_LENGTH,
    move: function() {
      this.moved = true;

      this.x += this.dx * SNAKE_SIZE;
      this.y += this.dy * SNAKE_SIZE;

      if (this.x < 0 || this.x >= kontra.canvas.width ||
          this.y < 0 || this.y >= kontra.canvas.height) {
        this.alive = false;
        return;
      }

      var index = this.y / SNAKE_SIZE * WIDTH + this.x / SNAKE_SIZE;

      // snake ran into itself
      if (this.body.indexOf(index) !== -1) {
        this.alive = false;
        return;
      }

      this.body.unshift(index);
      openTiles.splice(openTiles.indexOf(index), 1);

      if (this.body.length > this.length) {
        openTiles.push( this.body.pop() );
      }

      // ate pellet
      if (this.x === pellet.x && this.y === pellet.y) {
        this.length += 5;
        pellet.spawn();
      }
    },
    update: function(dt) {
      if (!this.alive) return;

      this.moved = false;

      if (queue.length) {
        for (var i = 0; i < queue.length; i++) {
          var dir = queue[i];

          if (dir === 'up' && this.dy !== 1) {
            this.dx = 0;
            this.dy = -1;
            this.move();
          }
          else if (dir === 'right' && this.dx !== -1) {
            this.dx = 1;
            this.dy = 0;
            this.move();
          }
          else if (dir === 'down' && this.dy !== -1) {
            this.dx = 0;
            this.dy = 1;
            this.move();
          }
          else if (dir === 'left' && this.dx !== 1) {
            this.dx = -1;
            this.dy = 0;
            this.move();
          }
        }

        if (!this.moved) {
          this.move();
        }

        queue.length = 0;
      }
      else {
        this.move();
      }
    },
    render: function() {
      this.context.fillStyle = this.color;

      for (var i = 0; i < this.body.length; i++) {
        var x = this.body[i] % WIDTH * SNAKE_SIZE;
        var y = (this.body[i] / WIDTH | 0) * SNAKE_SIZE;

        this.context.fillRect(x, y, SNAKE_SIZE, SNAKE_SIZE);
      }
    }
  });

  var pellet = kontra.sprite({
    spawn: function() {
      var index = getRandomInt(0, openTiles.length);
      this.x = openTiles[index] % WIDTH * SNAKE_SIZE;
      this.y = (openTiles[index] / WIDTH | 0) * SNAKE_SIZE;
      this.alive = true;
    },
    render: function() {
      if (this.alive) {
        kontra.context.beginPath();
        kontra.context.arc(this.x + SNAKE_SIZE / 2, this.y + SNAKE_SIZE / 2, SNAKE_SIZE / 2, 0, 2 * Math.PI);
        kontra.context.fill();
      }
    }
  });

  function reset() {
    counter = 0;

    snake.x = (WIDTH / 2 | 0) * SNAKE_SIZE;
    snake.y = (HEIGHT / 2 | 0) * SNAKE_SIZE;
    snake.body.length = 0;
    snake.length = START_LENGTH;
    snake.dx = 1;
    snake.dy = 0;
    snake.alive = true;

    pellet.spawn();
  }
  reset();

  // loop
  var counter = 0;
  var loop = kontra.gameLoop({
    update: function(dt) {
      counter += dt;

      game.updateKeys();

      if (game.escPressed) {
        loop.stop();
        game.goBack();

        // prevent game from displaying on last render loop
        setTimeout(function() {
          reset();
        }, 100);
      }

      if (game.enterPressed && !snake.alive) {
        reset();
      }

      if (snake.alive) {
        // create a queue of key presses so we don't loose keys and make it feel
        // like the game is unresponsive when the user presses them quickly
        if (game.upPressed) {
          // only allow one direction at a time
          if (queue.indexOf('up') === -1) {
            queue.push('up');
          }
        }
        else if (game.rightPressed) {
          if (queue.indexOf('right') === -1) {
            queue.push('right');
          }
        }
        else if (game.downPressed) {
          if (queue.indexOf('down') === -1) {
            queue.push('down');
          }
        }
        else if (game.leftPressed) {
          if (queue.indexOf('left') === -1) {
            queue.push('left');
          }
        }

        // slow down the snake fps
        if (counter > 1 / 15) {
          snake.update();
          counter -= 1 / 15;
        }
      }
    },
    render: function() {
      snake.render();
      pellet.render();
    },
    fps: 30
  });

  return loop;
})();