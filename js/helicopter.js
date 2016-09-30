game.helicopter = (function() {

  // constants
  var HELICOPTER_SIZE = 10;

  // variables
  var gapLength = 150;
  var gapX = kontra.canvas.width / 2 - gapLength / 2;
  var numGaps = kontra.canvas.height / HELICOPTER_SIZE + 5;

  var gaps = [];
  var gapIndex = 0;

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   * @see http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  for (var i = 0; i < numGaps; i++) {
    var gapX = getRandomInt(gapX - 2, gapX + 2);

    gaps.push({
      x: gapX,
      length: gapLength
    });
  }

  var player = kontra.sprite({
    x: kontra.canvas.width / 2 - HELICOPTER_SIZE,
    y: kontra.canvas.height - 50,
    render: function() {
      kontra.context.strokeStyle = '#fff';

      kontra.context.beginPath();
      kontra.context.moveTo(this.x, this.y);
      kontra.context.lineTo(this.x + HELICOPTER_SIZE, this.y - HELICOPTER_SIZE);
      kontra.context.lineTo(this.x + HELICOPTER_SIZE * 2, this.y);
      kontra.context.stroke();
    }
  });

  var loop = kontra.gameLoop({
    update: function(dt) {
      game.updateKeys();

      // gapIndex = (gapIndex + 1) % (gaps.length - 1);
      gapX = getRandomInt(gapX - 3, gapX + 3);
      gapLength = (gapLength > 40 ? gapLength - dt : gapLength);

      gaps.push({
        x: gapX,
        length: gapLength
      });

      gaps.shift();
    },
    render: function() {
      kontra.context.lineWidth = 5;
      kontra.context.fillStyle = '#fff';

      // walls
      kontra.context.beginPath();
      kontra.context.moveTo(0, 0);

      for (var i = 0, x = 0, gap; x < numGaps; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        kontra.context.lineTo(gap.x, y);

        if (i <= 0) {
          i = gaps.length;
        }
      }

      kontra.context.lineTo(0, kontra.canvas.height);
      kontra.context.fill();

      kontra.context.beginPath();
      kontra.context.moveTo(kontra.canvas.width, 0);

      for (var i = 0, x = 0, gap; x < numGaps; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        kontra.context.lineTo(gap.x + gap.length, y);

        if (i <= 0) {
          i = gaps.length;
        }
      }

      kontra.context.lineTo(kontra.canvas.width, kontra.canvas.height);
      kontra.context.fill();

      player.render();
    },
    fps: 30
  });

  return loop;

})();