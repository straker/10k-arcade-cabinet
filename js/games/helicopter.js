game.helicopter = (function() {

  // constants
  var HELICOPTER_SIZE = 10;

  // variables
  var numGaps = kontra.canvas.height / HELICOPTER_SIZE + 1;
  var gaps = [];
  var gapX, gapLength, distance;

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   * @see http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  var player = kontra.sprite({
    dx: 6,
    update: function() {
      if (game.leftPressed) {
        this.x -= this.dx;
      }
      else if (game.rightPressed) {
        this.x += this.dx;
      }

      if (this.x < gaps[5].x || this.x + HELICOPTER_SIZE * 2 > gaps[5].x + gaps[5].length) {
        this.alive = false;
      }
    },
    render: function() {
      kontra.context.strokeStyle = '#fff';

      kontra.context.beginPath();
      kontra.context.moveTo(this.x, this.y);
      kontra.context.lineTo(this.x + HELICOPTER_SIZE, this.y - HELICOPTER_SIZE);
      kontra.context.lineTo(this.x + HELICOPTER_SIZE * 2, this.y);
      kontra.context.stroke();
    }
  });

  player.alive = true;

  function reset() {
    player.alive = true;
    player.x = kontra.canvas.width / 2 - HELICOPTER_SIZE;
    player.y = kontra.canvas.height - HELICOPTER_SIZE * 5;

    gapLength = 150;
    gapX = kontra.canvas.width / 2 - gapLength / 2;
    distance = 0;

    // fill gaps
    for (var i = 0; i < numGaps; i++) {
      gapX = getRandomInt(gapX - 2, gapX + 2);

      gaps.push({
        x: gapX,
        length: gapLength
      });
    }
  }
  reset();

  var loop = kontra.gameLoop({
    update: function(dt) {
      game.updateKeys();

      if (game.escPressed) {
        loop.stop();
        game.goBack();

        // prevent game from displaying on last render loop
        setTimeout(function() {
          reset();
        }, 100);
      }

      if (game.enterPressed && !player.alive) {
        reset();
      }

      if (player.alive) {

        distance++;

        gapX = getRandomInt(gapX - 7, gapX + 7);
        gapLength = (gapLength > 75 ? gapLength - 0.25 : gapLength);

        gapX = Math.min(Math.max(5, gapX), kontra.canvas.width - gapLength - 5);

        gaps.push({
          x: gapX,
          length: gapLength
        });

        gaps.shift();

        player.update();
      }
    },
    render: function() {
      kontra.context.save();

      kontra.context.lineWidth = 5;
      kontra.context.fillStyle = '#fff';

      // walls
      kontra.context.beginPath();
      kontra.context.moveTo(0, 0);

      for (var i = gaps.length - 1, x = 0, gap; x < gaps.length; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        kontra.context.lineTo(gap.x, y);
      }

      kontra.context.lineTo(0, kontra.canvas.height);
      kontra.context.fill();

      kontra.context.beginPath();
      kontra.context.moveTo(kontra.canvas.width, 0);

      for (var i = gaps.length - 1, x = 0, gap; x < gaps.length; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        kontra.context.lineTo(gap.x + gap.length, y);
      }

      kontra.context.lineTo(kontra.canvas.width, kontra.canvas.height);
      kontra.context.fill();

      player.render();

      if (!player.alive) {
        kontra.context.fillStyle = '#f00'
        kontra.context.font = '50px monospace';
        kontra.context.fillText('DISTANCE:', 70, 100);
        kontra.context.fillText(distance, 160, 150);
      }

      kontra.context.restore();
    },
    fps: 30
  });

  return loop;
})();