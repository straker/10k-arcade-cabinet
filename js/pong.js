var pong = (function() {

  kontra.init('p');

  // constants
  var GAME_WIDTH = kontra.canvas.width;
  var GAME_HEIGHT = kontra.canvas.height;
  var PADDLE_WIDTH = 20;
  var PADDLE_HEIGHT = 100;
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
    update: function() {

    }
  });

  var computer = sprite({
    x: GAME_WIDTH - (PADDLE_WIDTH * 2),
    y: START_POSITION_Y,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#fff',
    score: 0
  });

  var ball = sprite({
    width: 10,
    height: 10,
    color: '#fff'
  });

  context.fillStyle = '#FFF';
  context.font = '60px monospace';

  var loop = kontra.gameLoop({
    update: function() {
      player.update();
      computer.update();
      ball.update();
    },
    render: function() {
      // middle divider
      for(var i = 5; i < GAME_HEIGHT; i += 20) {
        context.fillRect(GAME_WIDTH / 2 - 2, i, 4, 10);
      }

      // score
      context.fillText(player.score + ' ' + computer.score, 266, 60);

      player.render();
      computer.render();
      ball.render();
    }
  });

  return loop;
})();