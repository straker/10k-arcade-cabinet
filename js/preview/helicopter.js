// --------------------------------------------------
// HELICOPTER
// --------------------------------------------------
games.push( (function() {
  var COLOR = '#fff';
  var HELICOPTER_SIZE = 5;

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
      y: 95,
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
        kontra.context.beginPath();
        kontra.context.moveTo(this.x, this.y);
        kontra.context.lineTo(this.x + HELICOPTER_SIZE, this.y - HELICOPTER_SIZE);
        kontra.context.lineTo(this.x + HELICOPTER_SIZE * 2, this.y);
        kontra.context.stroke();
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
      kontra.context.fillStyle = COLOR;
      kontra.context.strokeStyle = COLOR;

      kontra.context.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      kontra.context.lineWidth = 3;

      // gaps
      kontra.context.beginPath();
      kontra.context.moveTo(0, 0);

      for (var i = gapIndex, x = 0, gap; x < 22; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        kontra.context.lineTo(gap.x, y);

        if (i <= 0) {
          i = gaps.length;
        }
      }

      kontra.context.lineTo(0, GAME_HEIGHT);
      kontra.context.fill();

      kontra.context.beginPath();
      kontra.context.moveTo(GAME_WIDTH, 0);

      for (var i = gapIndex, x = 0, gap; x < 22; i--, x++) {
        var gap = gaps[i];
        var y = HELICOPTER_SIZE * x;
        kontra.context.lineTo(gap.x + gap.length, y);

        if (i <= 0) {
          i = gaps.length;
        }
      }

      kontra.context.lineTo(GAME_WIDTH, GAME_HEIGHT);
      kontra.context.fill();

      helicopter.render();
    },
    reset: reset
  };
})() );