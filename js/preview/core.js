// constants
var CANVAS_WIDTH = kontra.canvas.width;
var CANVAS_HEIGHT = kontra.canvas.height;
var GAME_PADDING = 5;
var GAMES_PER_ROW = 3;
var NUM_ROWS = 3;
var GAME_WIDTH = (CANVAS_WIDTH - GAME_PADDING * GAMES_PER_ROW * 2) / GAMES_PER_ROW | 0;
var GAME_HEIGHT = (CANVAS_HEIGHT - GAME_PADDING * NUM_ROWS * 2) / NUM_ROWS | 0;

console.log('width:', GAME_WIDTH);
console.log('height:', GAME_HEIGHT);

// references
var querySelector = document.querySelector.bind(document);
var sprite = kontra.sprite;

var selection = 0;
var debounce = 1;
var games = [];
var gameBtns = document.querySelectorAll('.game');
var upPressed, rightPressed, downPressed, leftPressed;

for (var i = 0; i < gameBtns.length; i++) {
  // bind i
  (function(i) {
    gameBtns[i].addEventListener('click', function() {
      selection = i;
    });
  })(i);
}

/**
 * Convert degrees to radians.
 * @param {number} deg - Degrees.
 */
function degToRad(deg) {
  return deg * Math.PI / 180;
}

// reset all games
function triggerReset() {
  for (var i = 0; i < games.length; i++) {
    games[i].reset();
  }
}

// game was selected
function gameSelected() {
  var selectedGame = gameBtns[selection].getAttribute('data-game');

  if (game[selectedGame]) {
    loadGame(game[selectedGame]);
  }
  else if (!document.querySelector('script[src="js/' + selectedGame + '.js"]')) {
    var script = document.createElement('script');
    script.onload = function() {
      loadGame(game[selectedGame]);
    };
    script.src = 'js/' + selectedGame + '.js';
    document.head.appendChild(script);
  }
}

// load a game
function loadGame(selectedGame) {
  gameBtns[selection].blur();
  gameBtns[selection].setAttribute('tabindex', -1);
  gameBtns[selection].removeAttribute('aria-selected');

  game.loop.stop();
  selectedGame.start();
}

// --------------------------------------------------
// GAME_LOOP
// --------------------------------------------------
game.loop = kontra.gameLoop({
  update: function(dt) {
    game.updateKeys();

    debounce += dt;

    for (var i = 0; i < games.length; i++) {
      games[i].update(dt);
    }

    if (debounce > 0.25) {
      if (game.rightPressed) {
        gameBtns[selection].setAttribute('tabindex', -1);
        gameBtns[selection].removeAttribute('aria-selected');
        selection = (selection == games.length - 1 ? 2 : selection + 1);
      }
      else if (game.leftPressed) {
        gameBtns[selection].setAttribute('tabindex', -1);
        gameBtns[selection].removeAttribute('aria-selected');
        selection = (selection == 0 ? 0 : selection - 1);
      }

      if (game.rightPressed || game.leftPressed) {
        gameBtns[selection].focus();
        gameBtns[selection].setAttribute('tabindex', 0);
        gameBtns[selection].setAttribute('aria-selected', true);
        debounce = 0;
      }

      if (game.enterPressed) {
        gameSelected();
      }
    }

    else if (!game.rightPressed && !game.leftPressed) {
      debounce = 1;
    }
  },
  render: function() {
    for (var i = 0; i < games.length; i++) {
      kontra.context.save();
      kontra.context.translate(GAME_PADDING + GAME_PADDING * i * 2 + GAME_WIDTH * i, GAME_PADDING);

      games[i].render();

      kontra.context.restore();
    }
  },
  fps: 30
});

game.loop.start();
gameBtns[0].focus();