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